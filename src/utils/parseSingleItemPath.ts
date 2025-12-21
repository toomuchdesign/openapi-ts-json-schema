/**
 * Parse a dotted definition path and extract the schema name and relative directory name.
 *
 * @returns The extracted schema name and relative directory name
 */
export function parseSingleItemPath(path: string): {
  schemaName: string;
  schemaRelativeDirName: string;
} {
  const paths = path.split('.');
  const schemaName = paths.pop();

  if (!schemaName) {
    throw new Error(
      `[openapi-ts-json-schema] target not found in OAS definition: "${path}"`,
    );
  }

  return {
    schemaRelativeDirName: paths.join('.'),
    schemaName,
  };
}
