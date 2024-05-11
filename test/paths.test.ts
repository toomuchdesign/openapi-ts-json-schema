import path from 'path';
import { describe, it, expect } from 'vitest';
import { fixtures, makeTestOutputPath } from './test-utils';
import { openapiToTsJsonSchema } from '../src';

describe('OpenAPI paths', () => {
  it('Generates expected paths schemas', async () => {
    const { outputPath, metaData } = await openapiToTsJsonSchema({
      openApiSchema: path.resolve(fixtures, 'paths/specs.yaml'),
      outputPath: makeTestOutputPath('paths'),
      definitionPathsToGenerateFrom: ['paths'],
      silent: true,
    });

    const rootPathSchema = await import(path.resolve(outputPath, 'paths/_'));
    expect(rootPathSchema.default).toEqual({
      get: {
        responses: {
          '200': {
            content: {
              'application/json': {
                schema: {
                  type: ['string', 'null'],
                },
              },
            },
          },
        },
      },
    });

    const usersPathSchema = await import(
      path.resolve(outputPath, 'paths/_users_{id}')
    );

    const componentsSchemasUser = {
      type: ['object', 'null'],
      properties: {
        id: {
          type: 'integer',
        },
        name: {
          type: 'string',
        },
      },
      required: ['id', 'name'],
    };

    expect(usersPathSchema.default).toEqual({
      get: {
        tags: ['Users'],
        summary: 'Gets a user by ID.',
        description: 'Get users description',
        operationId: 'getUserById',
        parameters: {
          path: {
            properties: {
              id: {
                type: 'integer',
              },
            },
            required: ['id'],
            type: 'object',
          },
        },
        responses: {
          '200': {
            description: 'Successful operation',
            content: {
              'application/json': {
                schema: componentsSchemasUser,
              },
            },
          },
        },
      },
      post: {
        tags: ['Users'],
        summary: 'Posts a user by ID.',
        description: 'Post users description',
        operationId: 'postUserById',
        parameters: {
          path: {
            properties: {
              id: {
                type: 'integer',
              },
            },
            required: ['id'],
            type: 'object',
          },
        },
        requestBody: {
          description: 'Body description',
          required: true,
          content: {
            'application/json': {
              schema: componentsSchemasUser,
            },
            'application/xml': {
              schema: {
                type: ['object', 'null'],
                properties: {
                  id: {
                    type: 'integer',
                  },
                  name: {
                    type: 'string',
                  },
                },
                required: ['id', 'name'],
              },
            },
            'text/plain': {
              schema: {
                type: 'string',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Successful operation',
            content: {
              'application/json': {
                schema: componentsSchemasUser,
              },
            },
          },
        },
      },
    });
  });
});
