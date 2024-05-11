import { makeRelativeModulePath, PLACEHOLDER_REGEX } from '..';
import type { SchemaMetaDataMap } from '../../types';

/**
 * Replace Refs placeholders with imported schemas
 */
export function replacePlaceholdersWithImportedSchemas({
  schemaAsText,
  absoluteDirName,
  schemaMetaDataMap,
}: {
  schemaAsText: string;
  absoluteDirName: string;
  schemaMetaDataMap: SchemaMetaDataMap;
}): string {
  const importStatements = new Set<string>();

  // Replace placeholder occurrences with the relevant imported schema name
  let output = schemaAsText.replaceAll(PLACEHOLDER_REGEX, (_match, id) => {
    const importedSchema = schemaMetaDataMap.get(id);

    /* v8 ignore start */
    if (!importedSchema) {
      throw new Error(
        '[openapi-ts-json-schema] No matching schema found in "schemaMetaDataMap"',
      );
    }
    /* v8 ignore stop */

    // Evaluate imported schema relative path from current schema file
    const importedSchemaRelativePath = makeRelativeModulePath({
      fromDirectory: absoluteDirName,
      to: importedSchema.absoluteImportPath,
    });

    const { uniqueName } = importedSchema;

    importStatements.add(
      `import ${uniqueName} from "${importedSchemaRelativePath}"`,
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

  return output;
}
