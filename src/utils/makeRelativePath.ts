import path from 'node:path';

/**
 * Evaluate the relative path from/to the given absolute paths
 */
export function makeRelativePath({
  fromDirectory,
  to,
}: {
  fromDirectory: string;
  to: string;
}): string {
  return `.${path.sep}` + path.relative(fromDirectory, to);
}
