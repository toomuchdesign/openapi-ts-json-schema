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
      const schemaMeta = schemasToGenerate.get(schemaRelativePath);

      /* istanbul ignore if: It should not be possible to execute this condition -- @preserve */
      if (!schemaMeta) {
        throw new Error(
          '[openapi-ts-json-schema] No matching schema found in "schemasToGenerate"',
        );
      }

      const {
        schemaAbsoluteDirName: importedSchemaDirName,
        schemaName: importedSchemaName,
      } = schemaMeta;

      const importedSchemaRelativePath = path.relative(
        schemaAbsoluteDirName,
        path.resolve(importedSchemaDirName, importedSchemaName),
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
