import path from 'path';
// @ts-expect-error no type defs for namify
import namify from 'namify';
import filenamify from 'filenamify';
import {
  SchemaMetaInfoMap,
  JSONSchema,
  replaceInlinedRefsWithStringPlaceholder,
  patchJsonSchema,
  SchemaPatcher,
} from './';

/*
 * Just an utility function to add entries to SchemaMetaInfoMap Map
 * It could become a class, actually
 */
export function addSchemaToGenerationMap({
  schemasToGenerate,
  schemaRelativeDirName,
  schemaName,
  schema,
  // Options
  outputPath,
  schemaPatcher,
  experimentalImportRefs,
}: {
  schemasToGenerate: SchemaMetaInfoMap;
  schemaRelativeDirName: string;
  schemaName: string;
  schema: JSONSchema;
  outputPath: string;
  schemaPatcher?: SchemaPatcher;
  experimentalImportRefs: boolean;
}): void {
  const schemaRelativePath = path.join(schemaRelativeDirName, schemaName);
  // Do not override existing meta info of inlined schemas
  if (schemasToGenerate.has(schemaRelativePath) === false) {
    const originalSchema = experimentalImportRefs
      ? replaceInlinedRefsWithStringPlaceholder(schema)
      : schema;
    const patchedSchema = patchJsonSchema(originalSchema, schemaPatcher);

    schemasToGenerate.set(schemaRelativePath, {
      schemaAbsoluteDirName: path.join(outputPath, schemaRelativeDirName),
      schemaName,
      schemaFileName: filenamify(schemaName, { replacement: '|' }),
      schemaUniqueName: namify(schemaRelativePath),
      schema: patchedSchema,
    });
  }
}
