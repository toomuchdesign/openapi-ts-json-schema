import path from 'path';

import { describe, expect, it } from 'vitest';

import { openapiToTsJsonSchema } from '../src';
import { fixtures, makeTestOutputPath } from './test-utils';

/**
 * This test take too long to run
 */
describe('GitHub API', () => {
  it("doesn't error", async () => {
    await expect(
      openapiToTsJsonSchema({
        openApiDocument: path.resolve(fixtures, 'github-api/specs.yaml'),
        outputPath: makeTestOutputPath('github-api'),
        definitionPathsToGenerateFrom: ['components.schemas', 'paths'],
        refHandling: 'import',
        silent: true,
      }),
    ).resolves.not.toThrowError();
  }, 20000);
});
