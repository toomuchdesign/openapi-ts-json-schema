import fs from 'fs/promises';
import path from 'path';

import { describe, expect, it } from 'vitest';

import { openapiToTsJsonSchema } from '../src/index.js';
import { formatTypeScript } from '../src/utils/index.js';
import { fixturesPath, makeTestOutputPath } from './test-utils/index.js';

describe('refHandling option === "inline"', () => {
  it('Preserves original "$ref" information as a commented prop', async () => {
    const { outputPath } = await openapiToTsJsonSchema({
      openApiDocument: path.resolve(fixturesPath, 'ref-property/specs.yaml'),
      outputPath: makeTestOutputPath('refHandling-inline'),
      targets: {
        collections: ['components.schemas'],
      },
      refHandling: 'inline',
      silent: true,
    });

    const januarySchemaAsText = await fs.readFile(
      path.resolve(outputPath, 'components/schemas/January.ts'),
      {
        encoding: 'utf8',
      },
    );

    const expectedInlinedRef = `
  properties: {
    isJanuary: {
      // $ref: "#/components/schemas/Answer"
      description: "isJanuary description",
      type: ["string", "null"],
      enum: ["yes", "no", null],
    },
    isFebruary: {
      // $ref: "#/components/schemas/Answer"
      description: "isFebruary description",
      type: ["string", "null"],
      enum: ["yes", "no", null],
    },
  },`;

    expect(januarySchemaAsText).toEqual(
      expect.stringContaining(expectedInlinedRef),
    );
  });

  describe('Alias definitions', () => {
    it('inlines the referenced definition with original $ref comment', async () => {
      const { outputPath } = await openapiToTsJsonSchema({
        openApiDocument: path.resolve(
          fixturesPath,
          'alias-definition/specs.yaml',
        ),
        outputPath: makeTestOutputPath('refHandling-inline-alias-definition'),
        targets: {
          collections: ['components.schemas'],
        },
        refHandling: 'inline',
        silent: true,
      });

      const answerAliasDefinition = await import(
        path.resolve(outputPath, 'components/schemas/AnswerAliasDefinition')
      );

      expect(answerAliasDefinition.default).toEqual({
        type: ['string', 'null'],
        enum: ['yes', 'no', null],
      });

      const answerAliasDefinitionFile = await fs.readFile(
        path.resolve(outputPath, 'components/schemas/AnswerAliasDefinition.ts'),
        { encoding: 'utf8' },
      );

      expect(answerAliasDefinitionFile).toEqual(
        await formatTypeScript(`
          const schema = {
            // $ref: "#/components/schemas/Answer"
            type: ["string", "null"],
            enum: ["yes", "no", null],
          } as const;
          export default schema;`),
      );
    });
  });
});
