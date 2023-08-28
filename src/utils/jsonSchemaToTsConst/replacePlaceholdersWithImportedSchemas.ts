import path from 'node:path';
import { replacePlaceholdersWith, SchemaRecord } from '..';

/**
 * Replace Refs placeholders with imported schemas
 */
export function replacePlaceholdersWithImportedSchemas({
  schemaAsText,
  inlinedRefs,
  schemaAbsolutePath,
}: {
  schemaAsText: string;
  inlinedRefs: SchemaRecord;
  schemaAbsolutePath: string;
}): string {
  const importStatements = new Set<string>();

  let schemaWithReplacedPlaceholders = replacePlaceholdersWith({
    text: schemaAsText,
    replacer: (ref) => {
      const schemaMeta = inlinedRefs.get(ref);

      /* istanbul ignore if: It should not be possible to execute this condition -- @preserve */
      if (!schemaMeta) {
        throw new Error(
          '[openapi-ts-json-schema] No matching schema found in "inlinedRefs"',
        );
      }

      const {
        schemaAbsolutePath: importedSchemaPath,
        schemaName: importedSchemaName,
      } = schemaMeta;

      const importedSchemaRelativePath = path.relative(
        schemaAbsolutePath,
        path.resolve(importedSchemaPath, importedSchemaName),
      );

      importStatements.add(
        `import ${importedSchemaName} from "${importedSchemaRelativePath}"`,
      );

      // @TODO Avoid name clashes
      return importedSchemaName;
    },
  });

  if (importStatements.size > 0) {
    // Empty line between imports and schema :)
    schemaWithReplacedPlaceholders = '\n' + schemaWithReplacedPlaceholders;

    importStatements.forEach((entry) => {
      schemaWithReplacedPlaceholders =
        entry + '\n' + schemaWithReplacedPlaceholders;
    });
  }

  return schemaWithReplacedPlaceholders;
}
