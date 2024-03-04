import path from 'node:path';
import { filenamify } from './';

/**
 * Generate a local OpenAPI ref from a relative path and a schema name
 */
const TRALING_SLASH_REGEX = /\/$/;
export function pathToRef({
  schemaRelativeDirName,
  schemaName,
}: {
  schemaRelativeDirName: string;
  schemaName: string;
}): string {
  return (
    '#/' +
    path
      .normalize(schemaRelativeDirName)
      .replaceAll('.', '/')
      .replaceAll('\\', '/')
      .replace(TRALING_SLASH_REGEX, '') +
    '/' +
    filenamify(schemaName)
  );
}
