import path from 'path';
import fs from 'fs/promises';
import { describe, it, expect } from 'vitest';
import { importFresh, formatTypeScript } from './test-utils';
import { openapiToTsJsonSchema } from '../src';

const fixtures = path.resolve(__dirname, 'fixtures');

describe('"experimentalImportRefs" option', () => {
  it('Generates expected schema', async () => {
    const { outputPath } = await openapiToTsJsonSchema({
      openApiSchema: path.resolve(fixtures, 'complex/specs.yaml'),
      definitionPathsToGenerateFrom: ['paths'],
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
      import February from "../components.months/February";
      import January from "../components.months/January";

      export default {
        get: {
          responses: {
            "200": {
              description: "A description",
              content: {
                "application/json": {
                  schema: {
                    oneOf: [January, February],
                  },
                },
              },
            },
          },
        },
      } as const;`);

    expect(actualPath1File).toEqual(expectedPath1File);
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
      path.resolve(outputPath, 'components.months/January.ts'),
      {
        encoding: 'utf8',
      },
    );

    const expectedJanuarySchemaFile = await formatTypeScript(`
      import Answer from "../components.schemas/Answer";

      export default {
        description: "January description",
        type: "object",
        required: ["isJanuary"],
        properties: {
          isJanuary: Answer,
        },
      } as const;`);

    expect(actualJanuarySchemaFile).toEqual(expectedJanuarySchemaFile);

    // February schema
    const actualFebruarySchemaFile = await fs.readFile(
      path.resolve(outputPath, 'components.months/February.ts'),
      {
        encoding: 'utf8',
      },
    );

    const expectedFebruarySchemaFile = await formatTypeScript(`
      import Answer from "../components.schemas/Answer";

      export default {
        description: "February description",
        type: "object",
        required: ["isFebruary"],
        properties: {
          isFebruary: Answer,
        },
      } as const;`);

    expect(actualFebruarySchemaFile).toEqual(expectedFebruarySchemaFile);
  });
});
