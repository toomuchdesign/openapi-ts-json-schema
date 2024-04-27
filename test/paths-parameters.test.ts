import path from 'path';
import { describe, it, expect } from 'vitest';
import { fixtures, makeTestOutputPath } from './test-utils';
import { openapiToTsJsonSchema } from '../src';

describe('OpenAPI paths parameters', () => {
  it('Transforms parameters array into valid JSON schema', async () => {
    const { outputPath } = await openapiToTsJsonSchema({
      openApiSchema: path.resolve(fixtures, 'paths-parameters/specs.yaml'),
      outputPath: makeTestOutputPath('paths-parameters'),
      definitionPathsToGenerateFrom: ['paths'],
      silent: true,
    });

    const pathSchema = await import(
      path.resolve(outputPath, 'paths/v1_path-1')
    );

    expect(pathSchema.default).toEqual({
      $id: '/paths/v1_path-1',
      parameters: {
        headers: {
          type: 'object',
          required: ['path-header-param'],
          properties: {
            'path-header-param': {
              type: 'string',
            },
            'path-header-param-overridden-at-operation-level': {
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
              'header-param-1': {
                type: 'string',
              },
              'header-param-2': {
                type: 'string',
                enum: ['yes', 'no'],
              },
              // Merges path level parameters
              'path-header-param': {
                type: 'string',
              },
              // Overrides path level parameters
              'path-header-param-overridden-at-operation-level': {
                type: 'number',
              },
            },
            required: ['path-header-param', 'header-param-1', 'header-param-2'],
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
