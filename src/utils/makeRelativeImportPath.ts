import path from 'node:path';

import type { ImportExtension } from '../types.js';

/**
 * Evaluate the relative import path from a directory to a module
 * Accepts posix and win32 absolute urls and returns a relative import path ("./foo/bar")
 */
export function makeRelativeImportPath({
  fromDirectory,
  toModule,
  importExtension = 'js',
}: {
  fromDirectory: string;
  toModule: string;
  importExtension?: ImportExtension;
}): string {
  if (importExtension === 'js' && !toModule.endsWith('.js')) {
    toModule += '.js';
  } else if (importExtension === 'ts' && !toModule.endsWith('.ts')) {
    toModule += '.ts';
  }

  return (
    './' +
    path.relative(fromDirectory, toModule).replaceAll(path.sep, path.posix.sep)
  );
}
