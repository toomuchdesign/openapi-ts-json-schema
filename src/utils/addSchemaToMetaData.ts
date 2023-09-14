import path from 'node:path';
// @ts-expect-error no type defs for namify
import namify from 'namify';
import filenamify from 'filenamify';
import {
  replaceInlinedRefsWithStringPlaceholder,
  patchJsonSchema,
  refToPath,
} from '.';
import type {
  SchemaMetaDataMap,
  SchemaMetaData,
  JSONSchema,
  SchemaPatcher,
} from '../types';

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
  refHandling,
}: {
  id: string;
  schemaMetaDataMap: SchemaMetaDataMap;
  schema: JSONSchema;
  isRef: boolean;
  outputPath: string;
  schemaPatcher?: SchemaPatcher;
  refHandling: 'inline' | 'import' | 'keep';
}): void {
  // Do not override existing meta info of inlined schemas
  if (schemaMetaDataMap.has(id) === false) {
    const { schemaRelativeDirName, schemaName } = refToPath(id);
    const schemaRelativePath = path.join(schemaRelativeDirName, schemaName);
    const originalSchema =
      refHandling === 'import' || refHandling === 'keep'
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
