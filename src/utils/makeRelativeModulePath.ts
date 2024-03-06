import path from 'node:path';

/**
 * Evaluate the relative module path from/to 2 absolute paths.
 * Accepts posix and win32 absolute urls and return a relative modules path ("./foo/bar")
 */
export function makeRelativeModulePath({
  fromDirectory,
  to,
}: {
  fromDirectory: string;
  to: string;
}): string {
  return (
    './' + path.relative(fromDirectory, to).replaceAll(path.sep, path.posix.sep)
  );
}
