import path from 'node:path';
// @ts-expect-error no type defs for namify
import namify from 'namify';
import {
  filenamify,
  parseId,
  isOpenApiParameterObject,
  convertOpenApiParameterToJsonSchema,
} from '.';
import type {
  SchemaMetaDataMap,
  SchemaMetaData,
  JSONSchema,
  OpenApiObject,
} from '../types';

/*
 * Just an utility function to add entries to SchemaMetaDataMap Map keyed by ref
 */
export function addSchemaToMetaData({
  id,
  $id,
  schemaMetaDataMap,
  openApiDefinition,
  jsonSchema,
  isRef,
  shouldBeGenerated,
  // Options
  outputPath,
}: {
  id: string;
  $id: string;
  schemaMetaDataMap: SchemaMetaDataMap;
  openApiDefinition: OpenApiObject;
  jsonSchema: JSONSchema;
  isRef: boolean;
  shouldBeGenerated: boolean;
  outputPath: string;
}): void {
  const { schemaRelativeDirName, schemaName } = parseId(id);
  const absoluteDirName = path.join(outputPath, schemaRelativeDirName);
  const schemaFileName = filenamify(schemaName);
  const absoluteImportPath = path.join(absoluteDirName, schemaFileName);

  // Convert components.parameters after convertOpenApiPathsParameters is called
  if (isOpenApiParameterObject(openApiDefinition)) {
    jsonSchema = convertOpenApiParameterToJsonSchema(openApiDefinition);
  }

  const metaInfo: SchemaMetaData = {
    id,
    $id,
    uniqueName: namify(id),
    isRef,
    shouldBeGenerated,
    openApiDefinition,
    originalSchema: jsonSchema,

    absoluteDirName,
    absoluteImportPath,
    absolutePath: absoluteImportPath + '.ts',
  };

  schemaMetaDataMap.set(id, metaInfo);
}
