import path from 'node:path';

import type { ModuleSystem } from '../types.js';

/**
 * Evaluate the relative import path from a directory to a module
 * Accepts posix and win32 absolute urls and returns a relative import path ("./foo/bar")
 */
export function makeRelativeImportPath({
  fromDirectory,
  toModule,
  moduleSystem = 'esm',
}: {
  fromDirectory: string;
  toModule: string;
  moduleSystem?: ModuleSystem;
}): string {
  if (moduleSystem === 'esm' && !toModule.endsWith('.js')) {
    toModule += '.js';
  }

  return (
    './' +
    path.relative(fromDirectory, toModule).replaceAll(path.sep, path.posix.sep)
  );
}
