import path from 'path';
import fs from 'fs/promises';
import { describe, it, expect } from 'vitest';
import { fixtures, makeTestOutputPath } from './test-utils';
import { openapiToTsJsonSchema } from '../src';
import { formatTypeScript } from '../src/utils';

describe('$idMapper option', () => {
  describe('refHandling option === "inline"', () => {
    it('derives root "$id" value from "$idMapper"', async () => {
      const { outputPath } = await openapiToTsJsonSchema({
        openApiSchema: path.resolve(fixtures, 'ref-property/specs.yaml'),
        outputPath: makeTestOutputPath('refHandling-keep-refMapper-option'),
        definitionPathsToGenerateFrom: ['components.schemas'],
        silent: true,
        refHandling: 'inline',
        $idMapper: ({ id }) => `foo_${id}_bar`,
      });

      const actualSchema = await import(
        path.resolve(outputPath, 'components/schemas/January')
      );

      expect(actualSchema.default).toEqual({
        $id: 'foo_/components/schemas/January_bar',
        description: 'January description',
        properties: {
          isJanuary: {
            enum: ['yes', 'no', null],
            type: ['string', 'null'],
          },
        },
        required: ['isJanuary'],
        type: 'object',
      });
    });
  });

  describe('refHandling option === "import"', () => {
    it('derives root "$id" value from "$idMapper"', async () => {
      const { outputPath } = await openapiToTsJsonSchema({
        openApiSchema: path.resolve(fixtures, 'ref-property/specs.yaml'),
        outputPath: makeTestOutputPath('refHandling-keep-refMapper-option'),
        definitionPathsToGenerateFrom: ['components.schemas'],
        silent: true,
        refHandling: 'import',
        $idMapper: ({ id }) => `foo_${id}_bar`,
      });

      const actualSchema = await import(
        path.resolve(outputPath, 'components/schemas/January')
      );

      expect(actualSchema.default).toEqual({
        $id: 'foo_/components/schemas/January_bar',
        description: 'January description',
        properties: {
          isJanuary: {
            enum: ['yes', 'no', null],
            type: ['string', 'null'],
          },
        },
        required: ['isJanuary'],
        type: 'object',
      });
    });
  });

  describe('refHandling option === "keep"', () => {
    it('derives root "$id" and "$ref" values from "$idMapper"', async () => {
      const { outputPath } = await openapiToTsJsonSchema({
        openApiSchema: path.resolve(fixtures, 'ref-property/specs.yaml'),
        outputPath: makeTestOutputPath('refHandling-keep-refMapper-option'),
        definitionPathsToGenerateFrom: ['components.schemas'],
        silent: true,
        refHandling: 'keep',
        $idMapper: ({ id }) => `foo_${id}_bar`,
      });

      const actualSchema = await import(
        path.resolve(outputPath, 'components/schemas/January')
      );

      expect(actualSchema.default).toEqual({
        $id: 'foo_/components/schemas/January_bar',
        description: 'January description',
        properties: {
          isJanuary: {
            $ref: 'foo_/components/schemas/Answer_bar',
          },
        },
        required: ['isJanuary'],
        type: 'object',
      });
    });
  });
});
