import path from 'path';
import { describe, it, expect } from 'vitest';
import { importFresh } from './utils';
import { openapiToTsJsonSchema } from '../src';

const fixtures = path.resolve(__dirname, 'fixtures');

describe('definitionPathsToGenerateFrom option', () => {
  it('Dereferences and transforms even from paths not marked from generation', async () => {
    const { outputFolder } = await openapiToTsJsonSchema({
      openApiSchema: path.resolve(fixtures, 'parameters/specs.yaml'),
      definitionPathsToGenerateFrom: ['paths'],
      silent: true,
    });

    const pathSchema = await importFresh(
      path.resolve(outputFolder, 'paths/v1|path-1'),
    );

    expect(pathSchema.default).toEqual({
      get: {
        parameters: {
          headers: {
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
