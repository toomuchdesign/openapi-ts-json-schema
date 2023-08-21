import filenamify from 'filenamify';
import fs from 'fs/promises';
import path from 'path';
import {
  patchJsonSchema,
  jsonSchemaToTsConst,
  JSONSchema,
  SchemaPatcher,
  SchemaRecord,
} from './';

/**
 * Save TS JSON schema with the expected naming conventions
 */
export async function makeJsonSchemaFile({
  schema,
  schemaName,
  schemaOutputPath,
  schemaPatcher,
  inlinedRefs,
}: {
  schema: JSONSchema;
  schemaName: string;
  schemaOutputPath: string;
  schemaPatcher?: SchemaPatcher;
  inlinedRefs?: SchemaRecord;
}) {
  const schemaNamedEscaped = filenamify(schemaName, { replacement: '|' });
  const patchedSchema = patchJsonSchema(schema, schemaPatcher);
  const tsSchema = await jsonSchemaToTsConst({
    schema: patchedSchema,
    schemaOutputPath,
    inlinedRefs,
  });

  await fs.mkdir(schemaOutputPath, { recursive: true });
  await fs.writeFile(
    path.resolve(schemaOutputPath, `${schemaNamedEscaped}.ts`),
    tsSchema,
  );
}
