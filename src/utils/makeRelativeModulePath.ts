import path from 'node:path';

import type { ModuleSystem } from '../types.js';

/**
 * Evaluate the relative import path from a directory to a module
 * Accepts posix and win32 absolute urls and returns a relative import path ("./foo/bar")
 *
 * @TODO rename as makeRelativeImportPath
 * @TODO rename `to` as `toModule`
 * @TODO make `moduleSystem` required or pre-configured in InputPlugin
 */
export function makeRelativeModulePath({
  fromDirectory,
  to,
  moduleSystem = 'esm',
}: {
  fromDirectory: string;
  to: string;
  moduleSystem?: ModuleSystem;
}): string {
  if (moduleSystem === 'esm' && !to.endsWith('.js')) {
    to += '.js';
  }

  return (
    './' + path.relative(fromDirectory, to).replaceAll(path.sep, path.posix.sep)
  );
}
