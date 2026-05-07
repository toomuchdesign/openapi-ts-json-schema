import path from 'path';

import { describe, expect, it } from 'vitest';

import { openapiToTsJsonSchema } from '../src/index.js';
import { fixturesPath, makeTestOutputPath } from './test-utils/index.js';

/**
 * Heavy integration test using the real GitHub REST API spec (~7.5 MB, 1000+ schemas).
 * Skipped by default — run with `npm run test:heavy`.
 */
describe.skipIf(!process.env['RUN_HEAVY_TESTS'])('GitHub API', () => {
  it("doesn't error", async () => {
    await expect(
      openapiToTsJsonSchema({
        openApiDocument: path.resolve(fixturesPath, 'github-api/specs.yaml'),
        outputPath: makeTestOutputPath('github-api'),
        targets: {
          collections: ['components.schemas', 'paths'],
        },
        refHandling: 'import',
        silent: true,
      }),
    ).resolves.not.toThrow();
  }, 10_000);
});
