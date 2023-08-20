import path from 'node:path';
import { replacePlaceholdersWith, JSONSchema, refToPath } from './';

/**
 * Replace Refs placeholders with imported schemas
 */
export function replacePlaceholdersWithImportedSchemas({
  schemaAsText,
  replacementRefs,
  outputPath,
  schemaOutputPath,
}: {
  schemaAsText: string;
  replacementRefs: Map<string, JSONSchema>;
  outputPath: string;
  schemaOutputPath: string;
}): string {
  const importStatements = new Set<string>();
  let schemaWithReplacedPlaceholders = replacePlaceholdersWith({
    text: schemaAsText,
    replacer: (ref) => {
      const schema = replacementRefs.get(ref);
      if (!schema) {
        throw new Error('No matching schema found in "replacementRefs"');
      }

      const {
        schemaOutputPath: importedSchemaPath,
        schemaName: importedSchemaName,
      } = refToPath({
        ref,
        outputPath,
      });

      const relativePath = path.relative(
        schemaOutputPath,
        path.resolve(importedSchemaPath, importedSchemaName),
      );

      importStatements.add(
        `import ${importedSchemaName} from "${relativePath}"`,
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
