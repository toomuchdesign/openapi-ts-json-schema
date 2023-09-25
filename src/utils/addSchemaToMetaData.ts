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
  ref,
  schemaMetaDataMap,
  schema,
  isRef,
  // Options
  outputPath,
  schemaPatcher,
  refHandling,
}: {
  ref: string;
  schemaMetaDataMap: SchemaMetaDataMap;
  schema: JSONSchema;
  isRef: boolean;
  outputPath: string;
  schemaPatcher?: SchemaPatcher;
  refHandling: 'inline' | 'import' | 'keep';
}): void {
  // Do not override existing meta info of inlined schemas
  if (schemaMetaDataMap.has(ref) === false) {
    const { schemaRelativeDirName, schemaName, schemaRelativePath } =
      refToPath(ref);
    // Shall we generate the actual final schema here instead of makeJsonSchemaFiles?
    const schemaWithPlaceholders =
      refHandling === 'import' || refHandling === 'keep'
        ? replaceInlinedRefsWithStringPlaceholder(schema)
        : schema;
    const isAlias = typeof schemaWithPlaceholders === 'string';
    const patchedSchema = isAlias
      ? schemaWithPlaceholders
      : patchJsonSchema(schemaWithPlaceholders, schemaPatcher);
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
