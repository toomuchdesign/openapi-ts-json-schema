import path from 'node:path';

import { filenamify } from './index.js';

/**
 * Generate schema internal id
 */
const TRALING_SLASH_REGEX = /\/$/;
export function makeId({
  schemaRelativeDirName,
  schemaName,
}: {
  schemaRelativeDirName: string;
  schemaName: string;
}): string {
  const normalizedSchemaRelativeDirName =
    '/' +
    path
      .normalize(schemaRelativeDirName)
      // Supporting targets dot notation
      .replaceAll('.', '/')
      // Replace windows backslashes \
      .replaceAll('\\', '/')
      .replace(TRALING_SLASH_REGEX, '');

  // Shall we replace '/' with a different separator?
  return normalizedSchemaRelativeDirName + '/' + filenamify(schemaName);
}
