import path from 'path';
import { describe, it, expect } from 'vitest';
import { importFresh } from './test-utils';
import { openapiToTsJsonSchema } from '../src';

const fixtures = path.resolve(__dirname, 'fixtures');

describe('"experimentalImportRefs" option', () => {
  it('Imports refs instead of inlining', async () => {
    const { outputPath } = await openapiToTsJsonSchema({
      openApiSchema: path.resolve(fixtures, 'complex/specs.yaml'),
      definitionPathsToGenerateFrom: ['paths'],
      silent: true,
      experimentalImportRefs: true,
    });

    const path1 = await importFresh(
      path.resolve(outputPath, 'paths/v1|path-1'),
    );

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
  });
});
