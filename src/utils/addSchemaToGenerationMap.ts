import path from 'path';
import {
  SchemaMetaInfoMap,
  JSONSchema,
  replaceInlinedRefsWithStringPlaceholder,
} from './';

/*
 * Just an utility function to add entries to SchemaMetaInfoMap Map
 * It could become a class, actually
 */
export function addSchemaToGenerationMap({
  schemasToGenerate,
  schemaRelativeDirName,
  outputPath,
  schemaName,
  schema,
  experimentalImportRefs,
}: {
  schemasToGenerate: SchemaMetaInfoMap;
  schemaRelativeDirName: string;
  outputPath: string;
  schemaName: string;
  schema: JSONSchema;
  experimentalImportRefs: boolean;
}): void {
  const schemaRelativePath = path.join(schemaRelativeDirName, schemaName);
  // Do not override existing meta info of inlined schemas
  if (schemasToGenerate.has(schemaRelativePath) === false) {
    schemasToGenerate.set(schemaRelativePath, {
      schemaAbsoluteDirName: path.join(outputPath, schemaRelativeDirName),
      schemaName,
      schema: experimentalImportRefs
        ? replaceInlinedRefsWithStringPlaceholder(schema)
        : schema,
    });
  }
}
