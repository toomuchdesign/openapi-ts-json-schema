import path from 'path';
import fs from 'fs/promises';
import { describe, it, expect } from 'vitest';
import { fixtures, makeTestOutputPath } from './test-utils';
import { openapiToTsJsonSchema } from '../src';
import { formatTypeScript } from '../src/utils';

describe('refHandling option === "import"', () => {
  describe.each([
    {
      description: 'Generating only root schema',
      definitionPathsToGenerateFrom: ['paths'],
    },
    {
      description: 'Generating $ref schemas, too',
      definitionPathsToGenerateFrom: [
        'paths',
        'components.schemas',
        'components.schemas',
      ],
    },
  ])('$description', ({ definitionPathsToGenerateFrom }) => {
    it('Generates expected schema', async () => {
      const { outputPath } = await openapiToTsJsonSchema({
        openApiDocument: path.resolve(fixtures, 'complex/specs.yaml'),
        outputPath: makeTestOutputPath('refHandling-import'),
        definitionPathsToGenerateFrom,
        silent: true,
        refHandling: 'import',
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

      // Expectations against actual root schema file (make sure it actually imports refs :))
      const actualPath1File = await fs.readFile(
        path.resolve(outputPath, 'paths/_v1_path-1.ts'),
        {
          encoding: 'utf8',
        },
      );

      const expectedPath1File = await formatTypeScript(`
        import componentsSchemasFebruary from "./../components/schemas/February";
        import componentsSchemasJanuary from "./../components/schemas/January";

        const schema = {
          get: {
            responses: {
              "200": {
                description: "A description",
                content: {
                  "application/json": {
                    schema: {
                      oneOf: [
                        componentsSchemasJanuary,
                        componentsSchemasFebruary,
                        {
                          type: ["integer", "null"],
                          enum: [1, 0, null],
                          description: "Inline path schema",
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
        } as const;
        export default schema;`);

      expect(actualPath1File).toEqual(expectedPath1File);
    });
  });

  it('Generates expected $ref schemas (with and without $id)', async () => {
    const { outputPath } = await openapiToTsJsonSchema({
      openApiDocument: path.resolve(fixtures, 'ref-property/specs.yaml'),
      outputPath: makeTestOutputPath('refHandling-import-ref-schemas'),
      definitionPathsToGenerateFrom: ['components.schemas'],
      silent: true,
      refHandling: 'import',
    });

    // Answer schema
    const actualAnswerSchemaFile = await fs.readFile(
      path.resolve(outputPath, 'components/schemas/Answer.ts'),
      {
        encoding: 'utf8',
      },
    );

    const expectedAnswerSchemaFile = await formatTypeScript(`
      const schema = {
        type: ["string", "null"],
        enum: ["yes", "no", null],
      } as const;
      export default schema;`);

    expect(actualAnswerSchemaFile).toEqual(expectedAnswerSchemaFile);

    // January schema
    const actualJanuarySchemaFile = await fs.readFile(
      path.resolve(outputPath, 'components/schemas/January.ts'),
      {
        encoding: 'utf8',
      },
    );

    const expectedJanuarySchemaFile = await formatTypeScript(`
      import componentsSchemasAnswer from "./Answer";

      const schema = {
        description: "January description",
        type: "object",
        required: ["isJanuary"],
        properties: {
          isJanuary: componentsSchemasAnswer,
          isFebruary: componentsSchemasAnswer
        },
      } as const;
      export default schema;`);

    expect(actualJanuarySchemaFile).toEqual(expectedJanuarySchemaFile);
  });

  describe('Alias definitions', () => {
    it('re-exports original definition', async () => {
      const { outputPath } = await openapiToTsJsonSchema({
        openApiDocument: path.resolve(fixtures, 'alias-definition/specs.yaml'),
        outputPath: makeTestOutputPath('refHandling-import-alias-definition'),
        definitionPathsToGenerateFrom: ['components.schemas'],
        silent: true,
        refHandling: 'import',
      });

      const answerSchema = await import(
        path.resolve(outputPath, 'components/schemas/Answer')
      );

      const answerAliasDefinition = await import(
        path.resolve(outputPath, 'components/schemas/AnswerAliasDefinition')
      );

      expect(answerAliasDefinition.default).toEqual({
        ...answerSchema.default,
      });

      const actualAnswerAliasDefinitionSchemaFile = await fs.readFile(
        path.resolve(outputPath, 'components/schemas/AnswerAliasDefinition.ts'),
        {
          encoding: 'utf8',
        },
      );

      const expectedAnswerAliasDefinitionSchemaFile = await formatTypeScript(`
      import componentsSchemasAnswer from "./Answer";

      const schema = componentsSchemasAnswer;
      export default schema;`);

      expect(actualAnswerAliasDefinitionSchemaFile).toEqual(
        expectedAnswerAliasDefinitionSchemaFile,
      );
    });
  });
});
