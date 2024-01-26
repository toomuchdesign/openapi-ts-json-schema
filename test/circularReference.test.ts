import path from 'path';
import { describe, it, expect } from 'vitest';
import { fixtures, makeTestOutputPath } from './test-utils';
import { openapiToTsJsonSchema } from '../src';

describe('Circular reference', () => {
  describe('"refHandling" option', () => {
    describe('inline', () => {
      it('Throws expected error', async () => {
        await expect(
          openapiToTsJsonSchema({
            openApiSchema: path.resolve(
              fixtures,
              'circular-reference/specs.yaml',
            ),
            outputPath: makeTestOutputPath('circular-inline'),
            definitionPathsToGenerateFrom: ['components.schemas'],
            refHandling: 'inline',
          }),
        ).rejects.toThrow(
          '[openapi-ts-json-schema] Circular input definition detected. Use "import" or "keep" refHandling option, instead.',
        );
      });
    });

    describe('import', () => {
      it('Generates expected schema', async () => {
        const { outputPath } = await openapiToTsJsonSchema({
          openApiSchema: path.resolve(
            fixtures,
            'circular-reference/specs.yaml',
          ),
          outputPath: makeTestOutputPath('circular-import'),
          definitionPathsToGenerateFrom: ['components.schemas'],
          refHandling: 'import',
          silent: true,
        });

        const januarySchema = await import(
          path.resolve(outputPath, 'components/schemas/January')
        );

        expect(januarySchema.default).toEqual({
          description: 'January description',
          type: 'object',
          properties: {
            nextMonth: {
              description: 'February description',
              type: 'object',
              properties: {
                // Node stops recursion
                previousMonth: undefined,
              },
            },
          },
        });
      });
    });

    describe('keep', () => {
      it('Generates expected schema', async () => {
        const { outputPath } = await openapiToTsJsonSchema({
          openApiSchema: path.resolve(
            fixtures,
            'circular-reference/specs.yaml',
          ),
          outputPath: makeTestOutputPath('circular-keep'),
          definitionPathsToGenerateFrom: ['components.schemas'],
          refHandling: 'keep',
          silent: true,
        });

        const januarySchema = await import(
          path.resolve(outputPath, 'components/schemas/January')
        );

        expect(januarySchema.default).toEqual({
          description: 'January description',
          type: 'object',
          properties: {
            nextMonth: {
              $ref: '#/components/schemas/February',
            },
          },
        });
      });
    });
  });
});
