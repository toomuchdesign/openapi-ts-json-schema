import path from 'node:path';
// @ts-expect-error no type defs for namify
import namify from 'namify';
import {
  filenamify,
  parseId,
  isOpenApiParameter,
  convertOpenApiParameterToJsonSchema,
} from '.';
import type { SchemaMetaDataMap, SchemaMetaData, JSONSchema } from '../types';

/*
 * Just an utility function to add entries to SchemaMetaDataMap Map keyed by ref
 */
export function addSchemaToMetaData({
  id,
  $id,
  schemaMetaDataMap,
  schema,
  isRef,
  // Options
  outputPath,
}: {
  id: string;
  $id: string;
  schemaMetaDataMap: SchemaMetaDataMap;
  schema: JSONSchema;
  isRef: boolean;
  outputPath: string;
}): void {
  // Do not override existing meta info of inlined schemas
  if (!schemaMetaDataMap.has(id)) {
    const { schemaRelativeDirName, schemaName } = parseId(id);
    const absoluteDirName = path.join(outputPath, schemaRelativeDirName);
    const schemaFileName = filenamify(schemaName);
    const absoluteImportPath = path.join(absoluteDirName, schemaFileName);

    // Convert components.parameters after convertOpenApiPathsParameters is called
    if (isOpenApiParameter(schema)) {
      schema = convertOpenApiParameterToJsonSchema(schema);
    }

    const metaInfo: SchemaMetaData = {
      id,
      $id,
      uniqueName: namify(id),
      isRef,
      originalSchema: schema,

      absoluteDirName,
      absoluteImportPath,
      absolutePath: absoluteImportPath + '.ts',
    };

    schemaMetaDataMap.set(id, metaInfo);
  }
}
