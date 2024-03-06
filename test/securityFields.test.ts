import path from 'path';
import { describe, it, expect } from 'vitest';
import { fixtures, makeTestOutputPath } from './test-utils';
import { openapiToTsJsonSchema } from '../src';

describe('OpenApi security fields', () => {
  it('handles schema correctly', async () => {
    await expect(
      openapiToTsJsonSchema({
        openApiSchema: path.resolve(fixtures, 'security-fields/specs.yaml'),
        outputPath: makeTestOutputPath('security-fields'),
        definitionPathsToGenerateFrom: ['components.schemas', 'paths'],
        silent: true,
      }),
    ).resolves.not.toThrow();
  });
});
