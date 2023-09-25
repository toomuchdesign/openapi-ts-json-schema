import path from 'node:path';
// @ts-expect-error no type defs for namify
import namify from 'namify';
import filenamify from 'filenamify';
import { patchJsonSchema, refToPath } from '.';
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
  ref,
  schemaMetaDataMap,
  schema,
  isRef,
  // Options
  outputPath,
  schemaPatcher,
}: {
  ref: string;
  schemaMetaDataMap: SchemaMetaDataMap;
  schema: JSONSchema;
  isRef: boolean;
  outputPath: string;
  schemaPatcher?: SchemaPatcher;
}): void {
  // Do not override existing meta info of inlined schemas
  if (schemaMetaDataMap.has(ref) === false) {
    const { schemaRelativeDirName, schemaName, schemaRelativePath } =
      refToPath(ref);
    // Shall we generate the actual final schema here instead of makeJsonSchemaFiles?
    const patchedSchema = patchJsonSchema(schema, schemaPatcher);
    const schemaAbsoluteDirName = path.join(outputPath, schemaRelativeDirName);
    const schemaFileName = filenamify(schemaName, { replacement: '|' });
    const schemaAbsoluteImportPath = path.join(
      schemaAbsoluteDirName,
      schemaFileName,
    );

    const metaInfo: SchemaMetaData = {
      schemaId: `/${schemaRelativePath}`,
      schemaFileName,
      schemaAbsoluteDirName,
      schemaAbsoluteImportPath,
      schemaAbsolutePath: schemaAbsoluteImportPath + '.ts',
      schemaUniqueName: namify(schemaRelativePath),
      schema: patchedSchema,
      isRef,
    };
    schemaMetaDataMap.set(ref, metaInfo);
  }
}
