import path from 'path';
import fs from 'fs/promises';
import { describe, it, expect } from 'vitest';
import { fixtures, makeTestOutputPath } from './test-utils';
import { openapiToTsJsonSchema } from '../src';
import { formatTypeScript } from '../src/utils';

describe('refHandling option === "keep"', () => {
  it('Generates expected schemas preserving $ref pointer', async () => {
    const { outputPath } = await openapiToTsJsonSchema({
      openApiSchema: path.resolve(fixtures, 'complex/specs.yaml'),
      outputPath: makeTestOutputPath('refHandling-keep'),
      definitionPathsToGenerateFrom: ['paths'],
      silent: true,
      refHandling: 'keep',
    });

    const path1 = await import(path.resolve(outputPath, 'paths/_v1_path-1'));

    // Expectations against parsed root schema
    expect(path1.default).toEqual({
      get: {
        responses: {
          '200': {
            description: 'A description',
            content: {
              'application/json': {
                schema: {
                  oneOf: [
                    { $ref: '/components/schemas/January' },
                    { $ref: '/components/schemas/February' },
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

    // Expectations against actual root schema file
    const actualPath1File = await fs.readFile(
      path.resolve(outputPath, 'paths/_v1_path-1.ts'),
      {
        encoding: 'utf8',
      },
    );

    // Ensure "as const" is present
    const expectedPath1File = await formatTypeScript(`
      const schema = {
        get: {
          responses: {
            "200": {
              description: "A description",
              content: {
                "application/json": {
                  schema: {
                    oneOf: [
                      { $ref: "/components/schemas/January" },
                      { $ref: "/components/schemas/February" },
                      {
                        type: ['integer', 'null'],
                        enum: [1, 0, null],
                        description: 'Inline path schema'
                      },
                    ],
                  },
                },
              },
            },
          },
        },
      } as const;
      export default schema;

      const with$id = { $id: "/paths/_v1_path-1", ...schema } as const;
      export { with$id };`);

    expect(actualPath1File).toEqual(expectedPath1File);
  });

  it('Generates expected $ref schemas preserving $ref pointer', async () => {
    const { outputPath } = await openapiToTsJsonSchema({
      openApiSchema: path.resolve(fixtures, 'ref-property/specs.yaml'),
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
      required: ['isJanuary'],
      properties: {
        isJanuary: { $ref: '/components/schemas/Answer' },
        isFebruary: { $ref: '/components/schemas/Answer' },
      },
    });

    const answerSchema = await import(
      path.resolve(outputPath, 'components/schemas/Answer')
    );

    expect(answerSchema.default).toEqual({
      type: ['string', 'null'],
      enum: ['yes', 'no', null],
    });
  });

  describe('Alias definitions', () => {
    it('generate expected $ref object', async () => {
      const { outputPath } = await openapiToTsJsonSchema({
        openApiSchema: path.resolve(fixtures, 'alias-definition/specs.yaml'),
        outputPath: makeTestOutputPath('refHandling-keep-alias-definition'),
        definitionPathsToGenerateFrom: ['components.schemas'],
        silent: true,
        refHandling: 'keep',
      });

      const answerAliasDefinition = await import(
        path.resolve(outputPath, 'components/schemas/AnswerAliasDefinition')
      );

      expect(answerAliasDefinition.default).toEqual({
        $ref: '/components/schemas/Answer',
      });

      // Ensure "as const" is present
      const answerAliasDefinitionFile = await fs.readFile(
        path.resolve(outputPath, 'components/schemas/AnswerAliasDefinition.ts'),
        {
          encoding: 'utf8',
        },
      );

      expect(answerAliasDefinitionFile).toEqual(
        await formatTypeScript(`
          const schema = { $ref: "/components/schemas/Answer" } as const;
          export default schema;

          const with$id = { $id: "/components/schemas/AnswerAliasDefinition", ...schema } as const;
          export { with$id };`),
      );
    });
  });
});
