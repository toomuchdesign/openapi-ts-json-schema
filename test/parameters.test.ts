import path from 'path';
import { describe, it, expect } from 'vitest';
import { fixtures, makeTestOutputPath } from './test-utils';
import { openapiToTsJsonSchema } from '../src';

describe('OpenAPI parameters', () => {
  it('Transforms parameters array into a JSON schema record', async () => {
    const { outputPath } = await openapiToTsJsonSchema({
      openApiSchema: path.resolve(fixtures, 'parameters/specs.yaml'),
      outputPath: makeTestOutputPath('parameters'),
      definitionPathsToGenerateFrom: ['paths'],
      silent: true,
    });

    const pathSchema = await import(
      path.resolve(outputPath, 'paths/v1|path-1')
    );

    expect(pathSchema.default).toEqual({
      parameters: {
        headers: {
          type: 'object',
          required: ['path-headers-param-1'],
          properties: {
            'path-headers-param-1': {
              type: 'string',
            },
          },
        },
      },
      get: {
        parameters: {
          headers: {
            type: 'object',
            properties: {
              'headers-param-1': {
                type: 'string',
              },
              'headers-param-2': {
                type: 'string',
                enum: ['yes', 'no'],
              },
            },
            required: ['headers-param-1', 'headers-param-2'],
          },
          body: { type: 'string', enum: ['foo', 'bar'] },
          path: {
            type: 'object',
            properties: {
              'path-param-1': {
                type: 'string',
              },
            },
            required: ['path-param-1'],
          },
          query: {
            type: 'object',
            properties: {
              'query-param-1': {
                type: 'string',
              },
            },
            required: ['query-param-1'],
          },
        },

        responses: {
          '200': {
            content: { 'application/json': { schema: { type: 'string' } } },
          },
        },
      },
    });
  });
});
