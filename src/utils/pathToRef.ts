import path from 'node:path';
import filenamify from 'filenamify';

/**
 * Generate a local OpenAPI ref from a relative path and a schema name
 */
export function pathToRef({
  schemaRelativeDirName,
  schemaName,
}: {
  schemaRelativeDirName: string;
  schemaName: string;
}): string {
  return (
    '#/' +
    path.join(
      schemaRelativeDirName.replaceAll('.', '/'),
      filenamify(schemaName, { replacement: '|' }),
    )
  );
}
