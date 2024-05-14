import path from 'path';
import { describe, it, expect } from 'vitest';
import { fixtures, makeTestOutputPath } from './test-utils';
import { openapiToTsJsonSchema } from '../src';

/**
 * This test take too long to run
 */
describe('GitHub API', () => {
  it("doesn't error", async () => {
    await expect(
      openapiToTsJsonSchema({
        openApiSchema: path.resolve(fixtures, 'github-api/specs.yaml'),
        outputPath: makeTestOutputPath('github-api'),
        definitionPathsToGenerateFrom: ['components.schemas', 'paths'],
        refHandling: 'import',
        silent: true,
      }),
    ).resolves.not.toThrowError();
  }, 20000);
});
