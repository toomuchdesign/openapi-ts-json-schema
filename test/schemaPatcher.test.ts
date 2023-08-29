import path from 'path';
import { describe, it, expect } from 'vitest';
import { importFresh } from './test-utils';
import { openapiToTsJsonSchema } from '../src';

const fixtures = path.resolve(__dirname, 'fixtures');

describe('"schemaPatcher" option', () => {
  it('transforms generated JSON schemas', async () => {
    const { outputPath } = await openapiToTsJsonSchema({
      openApiSchema: path.resolve(fixtures, 'complex/specs.yaml'),
      definitionPathsToGenerateFrom: ['components.months', 'paths'],
      schemaPatcher: ({ schema }) => {
        if (schema.description === 'January description') {
          schema.description = 'Patched January description';
        }
      },
      silent: true,
    });

    const januarySchema = await importFresh(
      path.resolve(outputPath, 'components.months/January'),
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
    const pathSchema = await importFresh(
      path.resolve(outputPath, 'paths/v1|path-1'),
    );

    expect(
      pathSchema.default.get.responses[200].content['application/json'].schema
        .oneOf[0].description,
    ).toBe('Patched January description');
  });
});
