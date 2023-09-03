import {
  refToPath,
  SchemaMetaInfoMap,
  makeRelativePath,
  PLACEHOLDER_REGEX,
} from '..';

/**
 * Replace Refs placeholders with imported schemas
 */
export function replacePlaceholdersWithImportedSchemas({
  schemaAsText,
  schemaAbsoluteDirName,
  schemas,
}: {
  schemaAsText: string;
  schemaAbsoluteDirName: string;
  schemas: SchemaMetaInfoMap;
}): string {
  const importStatements = new Set<string>();

  // Replace placeholder occurrences with the relevant imported schema name
  let schema = schemaAsText.replaceAll(PLACEHOLDER_REGEX, (_match, ref) => {
    const { schemaRelativePath } = refToPath(ref);
    const importedSchema = schemas.get(schemaRelativePath);

    /* istanbul ignore if: It should not be possible to hit this condition -- @preserve */
    if (!importedSchema) {
      throw new Error(
        '[openapi-ts-json-schema] No matching schema found in "schemas"',
      );
    }

    // Evaluate imported schema relative path from current schema file
    const importedSchemaRelativePath = makeRelativePath({
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
