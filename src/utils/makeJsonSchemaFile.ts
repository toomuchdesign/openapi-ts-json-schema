import filenamify from 'filenamify';
import fs from 'fs/promises';
import path from 'path';
import {
  patchJsonSchema,
  jsonSchemaToTsConst,
  SchemaPatcher,
  InlinedRefs,
  SchemaMetaInfo,
  SchemaMetaInfoMap,
} from './';

/**
 * Save TS JSON schema with the expected naming conventions
 */
export async function makeJsonSchemaFile({
  schemaMetaInfo,
  schemasToGenerate,
  schemaPatcher,
  inlinedRefs,
}: {
  schemaMetaInfo: SchemaMetaInfo;
  schemasToGenerate: SchemaMetaInfoMap;
  schemaPatcher?: SchemaPatcher;
  inlinedRefs?: InlinedRefs;
}) {
  const { schemaName, schemaAbsoluteDirName, schema } = schemaMetaInfo;
  const patchedSchema = patchJsonSchema(schema, schemaPatcher);
  const tsSchema = await jsonSchemaToTsConst({
    schema: patchedSchema,
    schemaAbsoluteDirName,
    inlinedRefs,
    schemasToGenerate,
  });

  await fs.mkdir(schemaAbsoluteDirName, { recursive: true });
  const schemaNamedEscaped = filenamify(schemaName, { replacement: '|' });
  await fs.writeFile(
    path.resolve(schemaAbsoluteDirName, `${schemaNamedEscaped}.ts`),
    tsSchema,
  );
}
