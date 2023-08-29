import path from 'node:path';
import { replacePlaceholdersWith, refToPath, SchemaMetaInfoMap } from '..';

/**
 * Replace Refs placeholders with imported schemas
 */
export function replacePlaceholdersWithImportedSchemas({
  schemaAsText,
  schemaAbsoluteDirName,
  schemasToGenerate,
}: {
  schemaAsText: string;
  schemaAbsoluteDirName: string;
  schemasToGenerate: SchemaMetaInfoMap;
}): string {
  const importStatements = new Set<string>();

  let schemaWithReplacedPlaceholders = replacePlaceholdersWith({
    text: schemaAsText,
    replacer: (ref) => {
      const { schemaRelativePath } = refToPath(ref);
      const importedSchema = schemasToGenerate.get(schemaRelativePath);

      /* istanbul ignore if: It should not be possible to hit this condition -- @preserve */
      if (!importedSchema) {
        throw new Error(
          '[openapi-ts-json-schema] No matching schema found in "schemasToGenerate"',
        );
      }

      // Evaluate schema relative path from current schema file
      const importedSchemaRelativePath = path.relative(
        schemaAbsoluteDirName,
        path.resolve(
          importedSchema.schemaAbsoluteDirName,
          importedSchema.schemaName,
        ),
      );

      const { schemaUniqueName } = importedSchema;

      importStatements.add(
        `import ${schemaUniqueName} from "${importedSchemaRelativePath}"`,
      );

      return schemaUniqueName;
    },
  });

  if (importStatements.size > 0) {
    // Empty line between imports and schema 💅
    schemaWithReplacedPlaceholders = '\n' + schemaWithReplacedPlaceholders;

    importStatements.forEach((entry) => {
      schemaWithReplacedPlaceholders =
        entry + '\n' + schemaWithReplacedPlaceholders;
    });
  }

  return schemaWithReplacedPlaceholders;
}
