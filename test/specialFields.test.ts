import path from 'path';

import { describe, expect, it } from 'vitest';

import { openapiToTsJsonSchema } from '../src';
import { fixtures, makeTestOutputPath } from './test-utils';

describe('OpenApi special fields', () => {
  it('handles schema correctly', async () => {
    await expect(
      openapiToTsJsonSchema({
        openApiDocument: path.resolve(
          fixtures,
          'special-openapi-fields/specs.yaml',
        ),
        outputPath: makeTestOutputPath('special-openapi-fields'),
        definitionPathsToGenerateFrom: ['components.schemas', 'paths'],
        silent: true,
      }),
    ).resolves.not.toThrow();
  });
});
