import path from 'path';
// @ts-expect-error no type defs for namify
import namify from 'namify';
import filenamify from 'filenamify';
import {
  SchemaMetaInfoMap,
  SchemaMetaInfo,
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
  isRef,
}: {
  schemas: SchemaMetaInfoMap;
  schemaRelativeDirName: string;
  schemaName: string;
  schema: JSONSchema;
  outputPath: string;
  schemaPatcher?: SchemaPatcher;
  experimentalImportRefs: boolean;
  isRef: boolean;
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
    const schemaAbsoluteImportPath = path.join(
      schemaAbsoluteDirName,
      schemaFileName,
    );

    const metaInfo: SchemaMetaInfo = {
      schemaName,
      schemaFileName,
      schemaAbsoluteDirName,
      schemaAbsoluteImportPath,
      schemaAbsolutePath: schemaAbsoluteImportPath + '.ts',
      schemaUniqueName: namify(schemaRelativePath),
      schema: patchedSchema,
      isRef,
    };
    schemas.set(schemaRelativePath, metaInfo);
  }
}
