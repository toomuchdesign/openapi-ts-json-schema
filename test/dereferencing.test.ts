import path from 'path';
import { describe, it, expect } from 'vitest';
import { fixtures, makeTestOutputPath } from './test-utils';
import { openapiToTsJsonSchema } from '../src';

describe('Dereferencing', () => {
  it('Dereferences and transforms even from paths not marked for generation', async () => {
    const { outputPath } = await openapiToTsJsonSchema({
      openApiSchema: path.resolve(fixtures, 'ref-property/specs.yaml'),
      outputPath: makeTestOutputPath('dereferencing'),
      definitionPathsToGenerateFrom: ['components.schemas'],
      silent: true,
    });

    const januarySchema = await import(
      path.resolve(outputPath, 'components/schemas/January')
    );

    expect(januarySchema.default).toEqual({
      description: 'January description',
      type: 'object',
      required: ['isJanuary'],
      properties: {
        isJanuary: { type: ['string', 'null'], enum: ['yes', 'no', null] },
      },
    });
  });

  it('Transforms deeply nested schemas', async () => {
    const { outputPath } = await openapiToTsJsonSchema({
      openApiSchema: path.resolve(fixtures, 'complex/specs.yaml'),
      outputPath: makeTestOutputPath('dereferencing'),
      definitionPathsToGenerateFrom: ['paths'],
      silent: true,
    });

    const pathsSchema = await import(
      path.resolve(outputPath, 'paths/v1_path-1')
    );

    expect(
      pathsSchema.default.get.responses[200].content['application/json'].schema
        .oneOf[0],
    ).toEqual({
      description: 'January description',
      type: 'object',
      required: ['isJanuary'],
      properties: {
        isJanuary: { type: ['string', 'null'], enum: ['yes', 'no', null] },
      },
    });
  });
});
