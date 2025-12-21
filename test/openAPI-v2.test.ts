import path from 'path';

import { describe, expect, it } from 'vitest';

import { openapiToTsJsonSchema } from '../src/index.js';
import { fixturesPath, makeTestOutputPath } from './test-utils/index.js';

describe('OpenAPI v2', async () => {
  it('generates expected paths and definitions', async () => {
    const { outputPath } = await openapiToTsJsonSchema({
      openApiDocument: path.resolve(fixturesPath, 'open-api-v2/specs.yaml'),
      outputPath: makeTestOutputPath('open-api-v2'),
      targets: {
        collections: ['definitions', 'paths'],
      },
      refHandling: 'import',
      silent: true,
    });

    const petSchema = await import(path.resolve(outputPath, 'definitions/Pet'));
    expect(petSchema.default).toEqual({
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'integer' },
        name: { type: 'string' },
      },
    });

    const petsPathSchema = await import(
      path.resolve(outputPath, 'paths/_pets')
    );
    expect(petsPathSchema.default).toEqual({
      get: {
        description:
          'Returns all pets from the system that the user has access to',
        produces: ['application/json'],
        responses: {
          '200': {
            description: 'A list of pets.',
            schema: {
              type: 'array',
              items: petSchema.default,
            },
          },
        },
      },
    });
  });
});
