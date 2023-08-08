import path from 'path';
import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import { importFresh } from './utils';
import { openapiToTsJsonSchema } from '../src';

const fixtures = path.resolve(__dirname, 'fixtures');

describe('"schemaPatcher" option', () => {
  it('transforms generated JSON schemas', async () => {
    const { outputFolder } = await openapiToTsJsonSchema({
      openApiSchema: path.resolve(fixtures, 'mini-referenced/specs.yaml'),
      definitionPathsToGenerateFrom: ['components.months'],
      schemaPatcher: ({ schema }) => {
        if (schema.description === 'January description') {
          schema.description = 'Patched January description';
        }
      },
      silent: true,
    });

    const januarySchema = await importFresh(
      path.resolve(outputFolder, 'components.months/January'),
    );

    expect(januarySchema.default).toEqual({
      description: 'Patched January description',
      type: 'object',
      required: ['isJanuary'],
      properties: {
        isJanuary: { type: ['string', 'null'], enum: ['yes', 'no', null] },
      },
    });
  });
});
