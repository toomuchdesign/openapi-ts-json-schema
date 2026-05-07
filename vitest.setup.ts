import { rm } from 'node:fs/promises';

import { afterAll } from 'vitest';

import { getTestFileSubdir } from './test/test-utils/getTestFileSubdir.js';

/**
 * Each test file owns a subdirectory under `test-temp/` and cleans only its
 * own outputs. Scoping cleanup per-file keeps parallel runs safe and ensures
 * watch-mode reruns don't accumulate stale files.
 */
afterAll(async () => {
  await rm(getTestFileSubdir(), { recursive: true, force: true });
});
