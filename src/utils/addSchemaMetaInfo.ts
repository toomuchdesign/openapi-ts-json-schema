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
  refToPath,
} from '.';

/*
 * Just an utility function to add entries to SchemaMetaInfoMap Map keyed by ref
 */
export function addSchemaMetaInfo({
  id,
  schemas,
  schema,
  isRef,
  // Options
  outputPath,
  schemaPatcher,
  experimentalImportRefs,
}: {
  id: string;
  schemas: SchemaMetaInfoMap;
  schema: JSONSchema;
  isRef: boolean;
  outputPath: string;
  schemaPatcher?: SchemaPatcher;
  experimentalImportRefs: boolean;
}): void {
  // Do not override existing meta info of inlined schemas
  if (schemas.has(id) === false) {
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

    const metaInfo: SchemaMetaInfo = {
      schemaFileName,
      schemaAbsoluteDirName,
      schemaAbsoluteImportPath,
      schemaAbsolutePath: schemaAbsoluteImportPath + '.ts',
      schemaUniqueName: namify(schemaRelativePath),
      schema: patchedSchema,
      isRef,
    };
    schemas.set(id, metaInfo);
  }
}
