import path from 'node:path';

/**
 * Evaluate the relative path from/to the given absolute paths.
 */
export function makeRelativeModulePath({
  fromDirectory,
  to,
}: {
  fromDirectory: string;
  to: string;
}): string {
  return './' + path.posix.relative(fromDirectory, to);
}
