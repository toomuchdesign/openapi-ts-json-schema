import { makeRelativeModulePath, PLACEHOLDER_REGEX } from '..';
import type { SchemaMetaDataMap } from '../../types';

/**
 * Replace Refs placeholders with imported schemas
 */
export function replacePlaceholdersWithImportedSchemas({
  schemaAsText,
  absoluteDirName,
  schemaMetaDataMap,
  isRef,
}: {
  schemaAsText: string;
  absoluteDirName: string;
  schemaMetaDataMap: SchemaMetaDataMap;
  isRef: boolean;
}): string {
  const importStatements = new Set<string>();

  // Replace placeholder occurrences with the relevant imported schema name
  let output = schemaAsText.replaceAll(PLACEHOLDER_REGEX, (_match, id) => {
    const importedSchema = schemaMetaDataMap.get(id);

    /* c8 ignore start */
    if (!importedSchema) {
      throw new Error(
        '[openapi-ts-json-schema] No matching schema found in "schemaMetaDataMap"',
      );
    }
    /* c8 ignore stop */

    // Evaluate imported schema relative path from current schema file
    const importedSchemaRelativePath = makeRelativeModulePath({
      fromDirectory: absoluteDirName,
      to: importedSchema.absoluteImportPath,
    });

    const { uniqueName } = importedSchema;

    importStatements.add(
      `import {without$id as ${uniqueName}} from "${importedSchemaRelativePath}"`,
    );

    return uniqueName;
  });

  if (importStatements.size > 0) {
    // Empty line between imports and schema 💅
    output = '\n' + output;

    importStatements.forEach((entry) => {
      output = entry + '\n' + output;
    });
  }

  /**
   * Schemas imported as refs by other schemas should be
   * imported via this export since
   * JSON schema allows only root level $id
   */
  if (isRef) {
    output = output + '\n\n' + `const { $id, ...without$id } = schema;`;
    output = output + '\n' + `export { without$id };`;
  }

  return output;
}
