import path from 'path';

import { describe, expect, it } from 'vitest';

import { openapiToTsJsonSchema } from '../src/index.js';
import { fixturesPath, makeTestOutputPath } from './test-utils/index.js';

describe('Dereferencing', () => {
  it('Dereferences and transforms even from paths not marked for generation', async () => {
    const { outputPath } = await openapiToTsJsonSchema({
      openApiDocument: path.resolve(fixturesPath, 'ref-property/specs.yaml'),
      outputPath: makeTestOutputPath('dereferencing'),
      targets: {
        collections: ['components.schemas'],
      },
      refHandling: 'import',
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
        isFebruary: { type: ['string', 'null'], enum: ['yes', 'no', null] },
      },
    });
  });

  it('Transforms deeply nested schemas', async () => {
    const { outputPath } = await openapiToTsJsonSchema({
      openApiDocument: path.resolve(fixturesPath, 'complex/specs.yaml'),
      outputPath: makeTestOutputPath('dereferencing-deeply-nested'),
      targets: {
        collections: ['paths'],
      },
      refHandling: 'import',
      silent: true,
    });

    const pathsSchema = await import(
      path.resolve(outputPath, 'paths/_v1_path-1')
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
