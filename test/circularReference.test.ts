import path from 'path';
import { describe, it, expect } from 'vitest';
import { importFresh } from './utils';
import { openapiToTsJsonSchema } from '../src';

const fixtures = path.resolve(__dirname, 'fixtures');

describe('Circular reference', () => {
  it.fails(
    'Dereferences and transforms even from paths not marked for generation',
    async () => {
      const { outputPath } = await openapiToTsJsonSchema({
        openApiSchema: path.resolve(fixtures, 'circular-reference/specs.yaml'),
        definitionPathsToGenerateFrom: ['components.schemas'],
        silent: true,
      });

      const januarySchema = await importFresh(
        path.resolve(outputPath, 'components.schemas/January'),
      );

      expect(januarySchema.default).toEqual({
        description: 'January description',
        type: 'object',
        properties: {
          isJanuary: { type: ['string', 'null'], enum: ['yes', 'no', null] },
        },
      });

      const februarySchema = await importFresh(
        path.resolve(outputPath, 'components.schemas/February'),
      );
    },
  );
});
