import path from 'node:path';
import { replacePlaceholdersWith, SchemaRecord } from '..';

/**
 * Replace Refs placeholders with imported schemas
 */
export function replacePlaceholdersWithImportedSchemas({
  schemaAsText,
  inlinedRefs,
  schemaOutputPath,
}: {
  schemaAsText: string;
  inlinedRefs: SchemaRecord;
  schemaOutputPath: string;
}): string {
  const importStatements = new Set<string>();

  let schemaWithReplacedPlaceholders = replacePlaceholdersWith({
    text: schemaAsText,
    replacer: (ref) => {
      const schemaMeta = inlinedRefs.get(ref);
      if (!schemaMeta) {
        throw new Error(
          '[openapi-ts-json-schema] No matching schema found in "inlinedRefs"',
        );
      }

      const {
        schemaOutputPath: importedSchemaPath,
        schemaName: importedSchemaName,
      } = schemaMeta;

      const importedSchemaRelativePath = path.relative(
        schemaOutputPath,
        path.resolve(importedSchemaPath, importedSchemaName),
      );

      importStatements.add(
        `import ${importedSchemaName} from "${importedSchemaRelativePath}"`,
      );

      // @TODO Avoid name clashes
      return importedSchemaName;
    },
  });

  importStatements.forEach((entry) => {
    schemaWithReplacedPlaceholders =
      entry + '\n' + schemaWithReplacedPlaceholders;
  });

  return schemaWithReplacedPlaceholders;
}
