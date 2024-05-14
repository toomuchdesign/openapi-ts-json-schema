import path from 'path';
import { describe, it, expect } from 'vitest';
import { fixtures, makeTestOutputPath } from './test-utils';
import { openapiToTsJsonSchema } from '../src';

describe('OpenAPI v2', async () => {
  it('generates expected paths and definitions', async () => {
    const { outputPath } = await openapiToTsJsonSchema({
      openApiSchema: path.resolve(fixtures, 'open-api-v2/specs.yaml'),
      outputPath: makeTestOutputPath('open-api-v2'),
      definitionPathsToGenerateFrom: ['definitions', 'paths'],
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
