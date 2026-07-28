import path from 'path';

import { describe, expect, it } from 'vitest';

import { openapiToTsJsonSchema } from '../src/index.js';
import { fixturesPath, makeTestOutputPath } from './test-utils/index.js';

describe('Xquik search OpenAPI input', () => {
  it('generates path schemas for search query parameters and responses', async () => {
    const { outputPath } = await openapiToTsJsonSchema({
      openApiDocument: path.resolve(fixturesPath, 'xquik-search/specs.yaml'),
      outputPath: makeTestOutputPath('xquik-search'),
      targets: {
        collections: ['paths'],
      },
      refHandling: 'import',
      silent: true,
    });

    const searchPathSchema = await import(
      path.resolve(outputPath, 'paths/_api_v1_x_tweets_search')
    );

    expect(searchPathSchema.default).toEqual({
      get: {
        operationId: 'searchTweets',
        parameters: {
          query: {
            type: 'object',
            properties: {
              q: {
                type: 'string',
              },
              limit: {
                type: 'integer',
                minimum: 1,
                maximum: 100,
              },
            },
            required: ['q'],
          },
        },
        responses: {
          '200': {
            description: 'Search results',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['data'],
                  properties: {
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        required: ['id', 'text'],
                        properties: {
                          id: {
                            type: 'string',
                          },
                          text: {
                            type: 'string',
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        security: [
          {
            apiKey: [],
          },
        ],
      },
    });
  });
});
