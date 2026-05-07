import { randomBytes } from 'node:crypto';
import path from 'node:path';

import { getTestFileSubdir } from './getTestFileSubdir.js';

/**
 * Generate output paths in test-temp folder.
 * Outputs are namespaced under a per-test-file subdirectory so parallel test
 * files don't clash, and a random suffix prevents collisions when tests share
 * the same id.
 */
export function makeTestOutputPath(id: string): string {
  return path.resolve(
    getTestFileSubdir(),
    `${id}-${Date.now()}-${randomBytes(3).toString('hex')}`,
  );
}
