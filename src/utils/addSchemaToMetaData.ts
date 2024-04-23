import path from 'node:path';
// @ts-expect-error no type defs for namify
import namify from 'namify';
import { parseRef, refToPath, filenamify, refToId } from '.';
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
    const absoluteDirName = path.join(outputPath, schemaRelativeDirName);
    const schemaFileName = filenamify(schemaName);
    const absoluteImportPath = path.join(absoluteDirName, schemaFileName);

    const metaInfo: SchemaMetaData = {
      id: refToId(ref),
      uniqueName: namify(refPath),
      isRef,
      originalSchema: schema,

      absoluteDirName,
      absoluteImportPath,
      absolutePath: absoluteImportPath + '.ts',
    };

    schemaMetaDataMap.set(ref, metaInfo);
  }
}
