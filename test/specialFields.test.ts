import path from 'path';
import { describe, it, expect } from 'vitest';
import { fixtures, makeTestOutputPath } from './test-utils';
import { openapiToTsJsonSchema } from '../src';

describe('OpenApi special fields', () => {
  it('handles schema correctly', async () => {
    await expect(
      openapiToTsJsonSchema({
        openApiSchema: path.resolve(
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
