import path from 'path';
import fs from 'fs/promises';
import { describe, it, expect } from 'vitest';
import { importFresh, formatTypeScript } from './test-utils';
import { openapiToTsJsonSchema } from '../src';

const fixtures = path.resolve(__dirname, 'fixtures');

describe('"experimentalImportRefs" option', () => {
  describe.each([
    {
      description: 'Generating only root schema',
      definitionPathsToGenerateFrom: ['paths'],
    },
    {
      description: 'Generating also $ref schema',
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
        definitionPathsToGenerateFrom,
        silent: true,
        experimentalImportRefs: true,
      });

      const path1 = await importFresh(
        path.resolve(outputPath, 'paths/v1|path-1'),
      );

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

      // Expectations against actual root schema file
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
      definitionPathsToGenerateFrom: ['paths'],
      silent: true,
      experimentalImportRefs: true,
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
});
