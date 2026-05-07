import path from 'node:path';

import { expect } from 'vitest';

import { testTempPath } from './paths.js';

/**
 * Per-test-file subdirectory under `test-temp/`, derived from the running test
 * file path. Lets parallel test files own isolated output trees so each file
 * can clean up only its own outputs in `afterAll`.
 */
export function getTestFileSubdir(): string {
  const testPath = expect.getState().testPath;
  const basename = testPath
    ? path.basename(testPath, path.extname(testPath))
    : 'unknown';
  return path.resolve(testTempPath, basename);
}
