import path from 'path';
import { describe, it, expect } from 'vitest';
import { fixtures, makeTestOutputPath } from './test-utils';
import { openapiToTsJsonSchema } from '../src';

describe('"schemaPatcher" option', () => {
  it('transforms generated JSON schemas', async () => {
    const { outputPath } = await openapiToTsJsonSchema({
      openApiSchema: path.resolve(fixtures, 'complex/specs.yaml'),
      outputPath: makeTestOutputPath('schema-patcher'),
      definitionPathsToGenerateFrom: ['components.schemas', 'paths'],
      schemaPatcher: ({ schema }) => {
        if (schema.description === 'January description') {
          schema.description = 'Patched January description';
        }
      },
      refHandling: 'import',
      silent: true,
    });

    const januarySchema = await import(
      path.resolve(outputPath, 'components/schemas/January')
    );

    expect(januarySchema.default).toEqual({
      description: 'Patched January description',
      type: 'object',
      required: ['isJanuary'],
      properties: {
        isJanuary: { type: ['string', 'null'], enum: ['yes', 'no', null] },
      },
    });

    // Testing deep nested props being patched, too
    const pathSchema = await import(
      path.resolve(outputPath, 'paths/_v1_path-1')
    );

    expect(
      pathSchema.default.get.responses[200].content['application/json'].schema
        .oneOf[0].description,
    ).toBe('Patched January description');
  });
});
