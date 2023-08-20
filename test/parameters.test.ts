import path from 'path';
import { describe, it, expect } from 'vitest';
import { importFresh } from './utils';
import { openapiToTsJsonSchema } from '../src';

const fixtures = path.resolve(__dirname, 'fixtures');

describe('OpenAPI parameters', () => {
  it('Transforms parameters array into a JSON schema record', async () => {
    const { outputPath } = await openapiToTsJsonSchema({
      openApiSchema: path.resolve(fixtures, 'parameters/specs.yaml'),
      definitionPathsToGenerateFrom: ['paths'],
      silent: true,
    });

    const pathSchema = await importFresh(
      path.resolve(outputPath, 'paths/v1|path-1'),
    );

    expect(pathSchema.default).toEqual({
      parameters: {
        headers: {
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
            properties: {
              'headers-param-1': {
                type: 'string',
              },
            },
            required: ['headers-param-1'],
          },
          body: { type: 'string', enum: ['foo', 'bar'] },
          path: {
            properties: {
              'path-param-1': {
                type: 'string',
              },
            },
            required: ['path-param-1'],
          },
          query: {
            properties: {
              'query-param-1': {
                type: 'string',
              },
              'deferenced-query-param': {
                type: ['string', 'null'],
                enum: ['yes', 'no', null],
              },
            },
            required: ['query-param-1', 'deferenced-query-param'],
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
