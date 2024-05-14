import path from 'path';
import fs from 'fs/promises';
import { describe, it, expect } from 'vitest';
import { fixtures, makeTestOutputPath } from './test-utils';
import { openapiToTsJsonSchema } from '../src';
import { formatTypeScript } from '../src/utils';

describe('$idMapper option', () => {
  describe('refHandling option === "inline"', () => {
    it('generates with$id schema with relevant $id value', async () => {
      const { outputPath } = await openapiToTsJsonSchema({
        openApiSchema: path.resolve(fixtures, 'ref-property/specs.yaml'),
        outputPath: makeTestOutputPath('$idMapper--refHandling-inline'),
        definitionPathsToGenerateFrom: ['components.schemas'],
        silent: true,
        refHandling: 'inline',
        $idMapper: ({ id }) => `foo_${id}_bar`,
      });

      const actualSchema = await import(
        path.resolve(outputPath, 'components/schemas/January')
      );

      expect(actualSchema.with$id).toEqual({
        $id: 'foo_/components/schemas/January_bar',
        description: 'January description',
        properties: {
          isJanuary: {
            description: 'isJanuary description',
            enum: ['yes', 'no', null],
            type: ['string', 'null'],
          },
          isFebruary: {
            description: 'isFebruary description',
            enum: ['yes', 'no', null],
            type: ['string', 'null'],
          },
        },
        required: ['isJanuary'],
        type: 'object',
      });

      // Check specific with$id schema declaration
      const actualSchemaFile = await fs.readFile(
        path.resolve(outputPath, 'components/schemas/January.ts'),
        {
          encoding: 'utf8',
        },
      );

      const expectedSchemaWith$id = await formatTypeScript(`
      const with$id = { $id: "foo_/components/schemas/January_bar", ...schema };
      export { with$id };`);

      expect(actualSchemaFile).toContain(expectedSchemaWith$id);
    });
  });

  describe('refHandling option === "import"', () => {
    it('generates with$id schema with relevant $id value', async () => {
      const { outputPath } = await openapiToTsJsonSchema({
        openApiSchema: path.resolve(fixtures, 'ref-property/specs.yaml'),
        outputPath: makeTestOutputPath('$idMapper--refHandling-import'),
        definitionPathsToGenerateFrom: ['components.schemas'],
        silent: true,
        refHandling: 'import',
        $idMapper: ({ id }) => `foo_${id}_bar`,
      });

      const actualSchema = await import(
        path.resolve(outputPath, 'components/schemas/January')
      );

      expect(actualSchema.with$id).toEqual({
        $id: 'foo_/components/schemas/January_bar',
        description: 'January description',
        properties: {
          isJanuary: {
            enum: ['yes', 'no', null],
            type: ['string', 'null'],
          },
          isFebruary: {
            enum: ['yes', 'no', null],
            type: ['string', 'null'],
          },
        },
        required: ['isJanuary'],
        type: 'object',
      });

      // Check specific with$id schema declaration
      const actualSchemaFile = await fs.readFile(
        path.resolve(outputPath, 'components/schemas/January.ts'),
        {
          encoding: 'utf8',
        },
      );

      const expectedSchemaWith$id = await formatTypeScript(`
      const with$id = { $id: "foo_/components/schemas/January_bar", ...schema };
      export { with$id };`);

      expect(actualSchemaFile).toContain(expectedSchemaWith$id);
    });
  });

  describe('refHandling option === "keep"', () => {
    it('generates expcted with$id schema and "$ref" values', async () => {
      const { outputPath } = await openapiToTsJsonSchema({
        openApiSchema: path.resolve(fixtures, 'ref-property/specs.yaml'),
        outputPath: makeTestOutputPath('$idMapper--refHandling-keep'),
        definitionPathsToGenerateFrom: ['components.schemas'],
        silent: true,
        refHandling: 'keep',
        $idMapper: ({ id }) => `foo_${id}_bar`,
      });

      const actualSchema = await import(
        path.resolve(outputPath, 'components/schemas/January')
      );

      expect(actualSchema.with$id).toEqual({
        $id: 'foo_/components/schemas/January_bar',
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

      // Check specific with$id schema declaration
      const actualSchemaFile = await fs.readFile(
        path.resolve(outputPath, 'components/schemas/January.ts'),
        {
          encoding: 'utf8',
        },
      );

      const expectedSchemaWith$id = await formatTypeScript(`
      const with$id = { $id: "foo_/components/schemas/January_bar", ...schema };
      export { with$id };`);

      expect(actualSchemaFile).toContain(expectedSchemaWith$id);
    });
  });
});
