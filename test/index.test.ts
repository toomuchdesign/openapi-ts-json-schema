import { existsSync } from 'fs';
import path from 'path';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { openapiToTsJsonSchema } from '../src/index.js';
import { fixturesPath, makeTestOutputPath } from './test-utils/index.js';

describe('openapiToTsJsonSchema', () => {
  it('Generates expected JSON schemas', async () => {
    const { outputPath } = await openapiToTsJsonSchema({
      openApiDocument: path.resolve(fixturesPath, 'complex/specs.yaml'),
      outputPath: makeTestOutputPath('index'),
      targets: {
        collections: ['components.schemas', 'paths'],
      },
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
      openApiDocument: path.resolve(fixturesPath, 'ref-property/specs.yaml'),
      outputPath: makeTestOutputPath('index-delete-old'),
      targets: {
        collections: ['components.schemas'],
      },
      silent: true,
    });

    const previouslyGeneratedSchematPath = path.resolve(
      outputPath,
      'components/schemas',
      'Answer.ts',
    );

    expect(existsSync(previouslyGeneratedSchematPath)).toBe(true);

    await openapiToTsJsonSchema({
      openApiDocument: path.resolve(fixturesPath, 'ref-property/specs.yaml'),
      outputPath,
      targets: {
        collections: ['components.schemas'],
      },
      silent: true,
    });
  });

  describe('non existing openAPI definition file', () => {
    it('throws expected error', async () => {
      await expect(() =>
        openapiToTsJsonSchema({
          openApiDocument: path.resolve(fixturesPath, 'does-not-exist.yaml'),
          outputPath: makeTestOutputPath('index-non-existing-openAPI'),
          targets: {
            collections: ['components'],
          },
          silent: true,
        }),
      ).rejects.toThrow(
        "[openapi-ts-json-schema] Provided OpenAPI definition path doesn't exist:",
      );
    });
  });
});
