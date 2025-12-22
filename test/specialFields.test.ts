import path from 'path';

import { describe, expect, it } from 'vitest';

import { openapiToTsJsonSchema } from '../src/index.js';
import { fixturesPath, makeTestOutputPath } from './test-utils/index.js';

describe('OpenApi special fields', () => {
  it('handles schema correctly', async () => {
    await expect(
      openapiToTsJsonSchema({
        openApiDocument: path.resolve(
          fixturesPath,
          'special-openapi-fields/specs.yaml',
        ),
        outputPath: makeTestOutputPath('special-openapi-fields'),
        targets: {
          collections: ['components.schemas', 'paths'],
        },
        silent: true,
      }),
    ).resolves.not.toThrow();
  });
});
