import path from 'path';
// @ts-expect-error no type defs for namify
import namify from 'namify';
import filenamify from 'filenamify';
import {
  SchemaMetaDataMap,
  SchemaMetaData,
  JSONSchema,
  replaceInlinedRefsWithStringPlaceholder,
  patchJsonSchema,
  SchemaPatcher,
  refToPath,
} from '.';

/*
 * Just an utility function to add entries to SchemaMetaDataMap Map keyed by ref
 */
export function addSchemaToMetaData({
  id,
  schemaMetaDataMap,
  schema,
  isRef,
  // Options
  outputPath,
  schemaPatcher,
  experimentalImportRefs,
}: {
  id: string;
  schemaMetaDataMap: SchemaMetaDataMap;
  schema: JSONSchema;
  isRef: boolean;
  outputPath: string;
  schemaPatcher?: SchemaPatcher;
  experimentalImportRefs: boolean;
}): void {
  // Do not override existing meta info of inlined schemas
  if (schemaMetaDataMap.has(id) === false) {
    const { schemaRelativeDirName, schemaName } = refToPath(id);
    const schemaRelativePath = path.join(schemaRelativeDirName, schemaName);
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

    const metaInfo: SchemaMetaData = {
      schemaId: id,
      schemaFileName,
      schemaAbsoluteDirName,
      schemaAbsoluteImportPath,
      schemaAbsolutePath: schemaAbsoluteImportPath + '.ts',
      schemaUniqueName: namify(schemaRelativePath),
      schema: patchedSchema,
      isRef,
    };
    schemaMetaDataMap.set(id, metaInfo);
  }
}
