import path from 'node:path';
// @ts-expect-error no type defs for namify
import namify from 'namify';
import { parseRef, refToPath, filenamify } from '.';
import type { SchemaMetaDataMap, SchemaMetaData, JSONSchema } from '../types';

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
}: {
  ref: string;
  schemaMetaDataMap: SchemaMetaDataMap;
  schema: JSONSchema;
  isRef: boolean;
  outputPath: string;
}): void {
  // Do not override existing meta info of inlined schemas
  if (!schemaMetaDataMap.has(ref)) {
    const refPath = parseRef(ref);
    const { schemaRelativeDirName, schemaName } = refToPath(ref);
    const schemaAbsoluteDirName = path.join(outputPath, schemaRelativeDirName);
    const schemaFileName = filenamify(schemaName);
    const schemaAbsoluteImportPath = path.join(
      schemaAbsoluteDirName,
      schemaFileName,
    );

    const metaInfo: SchemaMetaData = {
      originalSchema: schema,
      schemaId: `/${refPath}`,
      schemaAbsoluteDirName,
      schemaAbsoluteImportPath,
      schemaAbsolutePath: schemaAbsoluteImportPath + '.ts',
      schemaUniqueName: namify(refPath),
      isRef,
    };
    schemaMetaDataMap.set(ref, metaInfo);
  }
}
