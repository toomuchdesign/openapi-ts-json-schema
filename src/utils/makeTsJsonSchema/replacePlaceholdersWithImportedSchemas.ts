import { makeRelativeModulePath, PLACEHOLDER_REGEX } from '..';
import type { SchemaMetaDataMap } from '../../types';

/**
 * Replace Refs placeholders with imported schemas
 */
export function replacePlaceholdersWithImportedSchemas({
  schemaAsText,
  schemaAbsoluteDirName,
  schemaMetaDataMap,
}: {
  schemaAsText: string;
  schemaAbsoluteDirName: string;
  schemaMetaDataMap: SchemaMetaDataMap;
}): string {
  const importStatements = new Set<string>();

  // Replace placeholder occurrences with the relevant imported schema name
  let schema = schemaAsText.replaceAll(PLACEHOLDER_REGEX, (_match, ref) => {
    const importedSchema = schemaMetaDataMap.get(ref);

    /* c8 ignore start */
    if (!importedSchema) {
      throw new Error(
        '[openapi-ts-json-schema] No matching schema found in "schemaMetaDataMap"',
      );
    }
    /* c8 ignore stop */

    // Evaluate imported schema relative path from current schema file
    const importedSchemaRelativePath = makeRelativeModulePath({
      fromDirectory: schemaAbsoluteDirName,
      to: importedSchema.schemaAbsoluteImportPath,
    });

    const { schemaUniqueName } = importedSchema;

    importStatements.add(
      `import ${schemaUniqueName} from "${importedSchemaRelativePath}"`,
    );

    return schemaUniqueName;
  });

  if (importStatements.size > 0) {
    // Empty line between imports and schema 💅
    schema = '\n' + schema;

    importStatements.forEach((entry) => {
      schema = entry + '\n' + schema;
    });
  }

  return schema;
}
