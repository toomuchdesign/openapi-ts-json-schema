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
} from '.';

/*
 * Just an utility function to add entries to SchemaMetaInfoMap Map
 * It could become a class, actually
 */
export function addSchemaMetaInfo({
  schemas,
  schemaRelativeDirName,
  schemaName,
  schema,
  // Options
  outputPath,
  schemaPatcher,
  experimentalImportRefs,
}: {
  schemas: SchemaMetaInfoMap;
  schemaRelativeDirName: string;
  schemaName: string;
  schema: JSONSchema;
  outputPath: string;
  schemaPatcher?: SchemaPatcher;
  experimentalImportRefs: boolean;
}): void {
  const schemaRelativePath = path.join(schemaRelativeDirName, schemaName);
  // Do not override existing meta info of inlined schemas
  if (schemas.has(schemaRelativePath) === false) {
    const originalSchema = experimentalImportRefs
      ? replaceInlinedRefsWithStringPlaceholder(schema)
      : schema;
    const patchedSchema = patchJsonSchema(originalSchema, schemaPatcher);
    const schemaAbsoluteDirName = path.join(outputPath, schemaRelativeDirName);
    const schemaFileName = filenamify(schemaName, { replacement: '|' });

    schemas.set(schemaRelativePath, {
      schemaAbsoluteDirName,
      schemaAbsolutePath: path.join(schemaAbsoluteDirName, schemaFileName),
      schemaName,
      schemaFileName,
      schemaUniqueName: namify(schemaRelativePath),
      schema: patchedSchema,
    });
  }
}
