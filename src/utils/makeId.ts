import path from 'node:path';
import { filenamify } from '.';

/**
 * Generate a local OpenAPI ref from a schema internal id
 */
const TRALING_SLASH_REGEX = /\/$/;
export function makeId({
  schemaRelativeDirName,
  schemaName,
}: {
  schemaRelativeDirName: string;
  schemaName: string;
}): string {
  return (
    '/' +
    path
      .normalize(schemaRelativeDirName)
      // Supporting definitionPathsToGenerateFrom dot notation
      .replaceAll('.', '/')
      .replaceAll('\\', '/')
      .replace(TRALING_SLASH_REGEX, '') +
    '/' +
    filenamify(schemaName)
  );
}
