import path from 'path';

import { describe, expect, it } from 'vitest';

import { openapiToTsJsonSchema } from '../src';
import { fixturesPath, makeTestOutputPath } from './test-utils';

describe('JSON OpenAPI input', async () => {
  it('generates expected schemas', async () => {
    const { outputPath } = await openapiToTsJsonSchema({
      openApiDocument: path.resolve(fixturesPath, 'json/specs.json'),
      outputPath: makeTestOutputPath('json'),
      definitionPathsToGenerateFrom: ['components.schemas'],
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
      },
    });
  });
});
