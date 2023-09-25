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
        'components.months',
        'components.schemas',
      ],
    },
  ])('$description', ({ definitionPathsToGenerateFrom }) => {
    it('Generates expected schema', async () => {
      const { outputPath } = await openapiToTsJsonSchema({
        openApiSchema: path.resolve(fixtures, 'complex/specs.yaml'),
        outputPath: makeTestOutputPath('refHandling-import'),
        definitionPathsToGenerateFrom,
        silent: true,
        refHandling: 'import',
      });

      const path1 = await import(path.resolve(outputPath, 'paths/v1|path-1'));

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
        path.resolve(outputPath, 'paths/v1|path-1.ts'),
        {
          encoding: 'utf8',
        },
      );

      const expectedPath1File = await formatTypeScript(`
        import componentsMonthsFebruary from "./../components/months/February";
        import componentsMonthsJanuary from "./../components/months/January";

        export default {
          get: {
            responses: {
              "200": {
                description: "A description",
                content: {
                  "application/json": {
                    schema: {
                      oneOf: [componentsMonthsJanuary, componentsMonthsFebruary],
                    },
                  },
                },
              },
            },
          },
        } as const;`);

      expect(actualPath1File).toMatch(expectedPath1File);
    });
  });

  it('Generates expected $ref schemas', async () => {
    const { outputPath } = await openapiToTsJsonSchema({
      openApiSchema: path.resolve(fixtures, 'complex/specs.yaml'),
      outputPath: makeTestOutputPath('refHandling-import'),
      definitionPathsToGenerateFrom: ['paths'],
      silent: true,
      refHandling: 'import',
    });

    // January schema
    const actualJanuarySchemaFile = await fs.readFile(
      path.resolve(outputPath, 'components/months/January.ts'),
      {
        encoding: 'utf8',
      },
    );

    const expectedJanuarySchemaFile = await formatTypeScript(`
      import componentsSchemasAnswer from "./../schemas/Answer";

      export default {
        description: "January description",
        type: "object",
        required: ["isJanuary"],
        properties: {
          isJanuary: componentsSchemasAnswer,
        },
      } as const;`);

    expect(actualJanuarySchemaFile).toMatch(expectedJanuarySchemaFile);

    // February schema
    const actualFebruarySchemaFile = await fs.readFile(
      path.resolve(outputPath, 'components/months/February.ts'),
      {
        encoding: 'utf8',
      },
    );

    const expectedFebruarySchemaFile = await formatTypeScript(`
      import componentsSchemasAnswer from "./../schemas/Answer";

      export default {
        description: "February description",
        type: "object",
        required: ["isFebruary"],
        properties: {
          isFebruary: componentsSchemasAnswer,
        },
      } as const;`);

    expect(actualFebruarySchemaFile).toMatch(expectedFebruarySchemaFile);
  });

  describe('Alias definitions', () => {
    it('re-exports original definition', async () => {
      const { outputPath } = await openapiToTsJsonSchema({
        openApiSchema: path.resolve(fixtures, 'alias-definitions/specs.yaml'),
        outputPath: makeTestOutputPath('refHandling-import-alias-definitions'),
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

      expect(answerSchema.default).toEqual(answerAliasDefinition.default);
      expect(answerSchema.default).toBe(answerAliasDefinition.default);
    });
  });
});
