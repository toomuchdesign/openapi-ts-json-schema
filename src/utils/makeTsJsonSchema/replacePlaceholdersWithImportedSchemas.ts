import type { ModuleSystem, SchemaMetaDataMap } from '../../types.js';
import { PLACEHOLDER_REGEX, makeRelativeModulePath } from '../index.js';

/**
 * Replace id placeholders with imported schemas
 */
export function replacePlaceholdersWithImportedSchemas({
  schemaAsText,
  absoluteDirName,
  schemaMetaDataMap,
  moduleSystem,
}: {
  schemaAsText: string;
  absoluteDirName: string;
  schemaMetaDataMap: SchemaMetaDataMap;
  moduleSystem: ModuleSystem;
}): string {
  const importStatements = new Set<string>();

  // Replace placeholder occurrences with the relevant imported schema name
  let output = schemaAsText.replaceAll(PLACEHOLDER_REGEX, (_match, id) => {
    const importedSchema = schemaMetaDataMap.get(id);

    /* v8 ignore if -- @preserve */
    if (!importedSchema) {
      throw new Error(
        '[openapi-ts-json-schema] No matching schema found in "schemaMetaDataMap"',
      );
    }

    // Evaluate imported schema using CJS or ESM import
    const importedSchemaPath = makeRelativeModulePath({
      fromDirectory: absoluteDirName,
      to: importedSchema.absoluteImportPath,
      moduleSystem,
    });

    const { uniqueName } = importedSchema;
    importStatements.add(`import ${uniqueName} from "${importedSchemaPath}"`);
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
