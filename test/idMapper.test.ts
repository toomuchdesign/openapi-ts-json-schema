import path from 'path';
import { describe, it, expect } from 'vitest';
import { fixtures, makeTestOutputPath } from './test-utils';
import { openapiToTsJsonSchema } from '../src';

describe('idMapper option', () => {
  describe('refHandling option === "keep"', () => {
    it('generates expected schema and "$ref" values generated from idMapper option', async () => {
      const { outputPath } = await openapiToTsJsonSchema({
        openApiDocument: path.resolve(fixtures, 'ref-property/specs.yaml'),
        outputPath: makeTestOutputPath('idMapper--refHandling-keep'),
        definitionPathsToGenerateFrom: ['components.schemas'],
        silent: true,
        refHandling: 'keep',
        idMapper: ({ id }) => `foo_${id}_bar`,
      });

      const actualSchema = await import(
        path.resolve(outputPath, 'components/schemas/January')
      );

      expect(actualSchema.default).toEqual({
        description: 'January description',
        properties: {
          isJanuary: {
            $ref: 'foo_/components/schemas/Answer_bar',
          },
          isFebruary: {
            $ref: 'foo_/components/schemas/Answer_bar',
          },
        },
        required: ['isJanuary'],
        type: 'object',
      });
    });
  });
});
