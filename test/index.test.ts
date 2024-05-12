import path from 'path';
import { existsSync } from 'fs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fixtures, makeTestOutputPath } from './test-utils';
import { openapiToTsJsonSchema } from '../src';

describe('openapiToTsJsonSchema', () => {
  it('Generates expected JSON schemas', async () => {
    const { outputPath } = await openapiToTsJsonSchema({
      openApiSchema: path.resolve(fixtures, 'complex/specs.yaml'),
      outputPath: makeTestOutputPath('index'),
      definitionPathsToGenerateFrom: ['paths', 'components.schemas'],
      silent: true,
    });

    const januarySchema = await import(
      path.resolve(outputPath, 'components/schemas/January')
    );
    const februarySchema = await import(
      path.resolve(outputPath, 'components/schemas/February')
    );

    // definition paths get escaped
    const path1 = await import(path.resolve(outputPath, 'paths/_v1_path-1'));

    expect(januarySchema.default).toEqual({
      description: 'January description',
      type: 'object',
      required: ['isJanuary'],
      properties: {
        isJanuary: { type: ['string', 'null'], enum: ['yes', 'no', null] },
      },
    });

    expect(februarySchema.default).toEqual({
      description: 'February description',
      type: 'object',
      required: ['isFebruary'],
      properties: {
        isFebruary: { type: ['string', 'null'], enum: ['yes', 'no', null] },
      },
    });

    expect(path1.default).toEqual({
      get: {
        responses: {
          '200': {
            description: 'A description',
            content: {
              'application/json': {
                schema: {
                  oneOf: [
                    {
                      description: 'January description',
                      type: 'object',
                      required: ['isJanuary'],
                      properties: {
                        isJanuary: {
                          type: ['string', 'null'],
                          enum: ['yes', 'no', null],
                        },
                      },
                    },
                    {
                      description: 'February description',
                      type: 'object',
                      required: ['isFebruary'],
                      properties: {
                        isFebruary: {
                          type: ['string', 'null'],
                          enum: ['yes', 'no', null],
                        },
                      },
                    },
                    {
                      description: 'Inline path schema',
                      type: ['integer', 'null'],
                      enum: [1, 0, null],
                    },
                  ],
                },
              },
            },
          },
        },
      },
    });
  });

  it('deletes previously generated schemas', async () => {
    const { outputPath } = await openapiToTsJsonSchema({
      openApiSchema: path.resolve(fixtures, 'ref-property/specs.yaml'),
      outputPath: makeTestOutputPath('index-delete-old'),
      definitionPathsToGenerateFrom: ['components.schemas'],
      silent: true,
    });

    const previouslyGeneratedSchematPath = path.resolve(
      outputPath,
      'components/schemas',
      'Answer.ts',
    );

    expect(existsSync(previouslyGeneratedSchematPath)).toBe(true);

    await openapiToTsJsonSchema({
      openApiSchema: path.resolve(fixtures, 'ref-property/specs.yaml'),
      outputPath,
      definitionPathsToGenerateFrom: ['components.schemas'],
      silent: true,
    });
  });

  describe('non existing openAPI definition file', () => {
    it('throws expected error', async () => {
      await expect(() =>
        openapiToTsJsonSchema({
          openApiSchema: path.resolve(fixtures, 'does-not-exist.yaml'),
          outputPath: makeTestOutputPath('index-non-existing-openAPI'),
          definitionPathsToGenerateFrom: ['components'],
          silent: true,
        }),
      ).rejects.toThrow(
        "[openapi-ts-json-schema] Provided OpenAPI definition path doesn't exist:",
      );
    });
  });

  describe('"definitionPathsToGenerateFrom" option', () => {
    beforeEach(() => {
      vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    describe('empty', async () => {
      it('logs expected message', async () => {
        await openapiToTsJsonSchema({
          openApiSchema: path.resolve(fixtures, 'ref-property/specs.yaml'),
          outputPath: makeTestOutputPath(
            'index-definitionPathsToGenerateFrom-missing',
          ),
          definitionPathsToGenerateFrom: [],
        });

        expect(console.log).toHaveBeenCalledWith(
          `[openapi-ts-json-schema] ⚠️ No schemas will be generated since definitionPathsToGenerateFrom option is empty`,
        );
      });
    });

    describe('containing non-relative paths', async () => {
      it('throws with expected message', async () => {
        await expect(
          openapiToTsJsonSchema({
            openApiSchema: path.resolve(fixtures, 'ref-property/specs.yaml'),
            outputPath: makeTestOutputPath(
              'index-definitionPathsToGenerateFrom-non-relative',
            ),
            definitionPathsToGenerateFrom: ['paths', '/components.schema'],
          }),
        ).rejects.toThrow(
          '[openapi-ts-json-schema] "definitionPathsToGenerateFrom" must be an array of relative paths. "/components.schema" found.',
        );
      });
    });
  });
});
