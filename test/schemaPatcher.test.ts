import path from 'path';

import { describe, expect, it } from 'vitest';

import { openapiToTsJsonSchema } from '../src';
import { fixturesPath, makeTestOutputPath } from './test-utils';

describe('"schemaPatcher" option', () => {
  describe.each([
    { refHandling: 'inline' },
    { refHandling: 'import' },
    { refHandling: 'keep' },
  ] as const)('$refHandling', ({ refHandling }) => {
    it('transforms generated JSON schemas', async () => {
      const { outputPath } = await openapiToTsJsonSchema({
        openApiDocument: path.resolve(fixturesPath, 'complex/specs.yaml'),
        outputPath: makeTestOutputPath(`schema-patcher-${refHandling}`),
        definitionPathsToGenerateFrom: ['components.schemas', 'paths'],
        schemaPatcher: ({ schema }) => {
          if (schema.description === 'January description') {
            schema.description = 'Patched January description';
          }
        },
        refHandling,
        silent: true,
      });

      const januarySchema = await import(
        path.resolve(outputPath, 'components/schemas/January')
      );

      expect(januarySchema.default).toEqual({
        description: 'Patched January description',
        type: 'object',
        required: ['isJanuary'],
        properties: expect.any(Object),
      });

      // Testing deep nested props being patched, too (keep will just show a ref)
      const pathSchema = await import(
        path.resolve(outputPath, 'paths/_v1_path-1')
      );

      if (refHandling === 'inline' || refHandling === 'import') {
        expect(
          pathSchema.default.get.responses[200].content['application/json']
            .schema.oneOf[0].description,
        ).toBe('Patched January description');
      }
    });

    describe('circular reference', () => {
      it('transforms generated JSON schemas', async () => {
        await expect(() =>
          openapiToTsJsonSchema({
            openApiDocument: path.resolve(
              fixturesPath,
              'circular-reference/specs.yaml',
            ),
            outputPath: makeTestOutputPath(
              `schema-patcher-circular-reference-${refHandling}`,
            ),
            definitionPathsToGenerateFrom: ['components.schemas', 'paths'],
            schemaPatcher: ({ schema }) => {
              if (schema.description === 'January description') {
                schema.description = 'Patched January description';
              }
            },
            refHandling,
            silent: true,
          }),
        ).not.toThrow();
      });
    });
  });
});
