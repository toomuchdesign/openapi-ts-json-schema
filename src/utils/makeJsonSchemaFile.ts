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
  schemaAbsolutePath,
  schemaPatcher,
  inlinedRefs,
}: {
  schema: JSONSchema;
  schemaName: string;
  schemaAbsolutePath: string;
  schemaPatcher?: SchemaPatcher;
  inlinedRefs?: SchemaRecord;
}) {
  const schemaNamedEscaped = filenamify(schemaName, { replacement: '|' });
  const patchedSchema = patchJsonSchema(schema, schemaPatcher);
  const tsSchema = await jsonSchemaToTsConst({
    schema: patchedSchema,
    schemaAbsolutePath,
    inlinedRefs,
  });

  await fs.mkdir(schemaAbsolutePath, { recursive: true });
  await fs.writeFile(
    path.resolve(schemaAbsolutePath, `${schemaNamedEscaped}.ts`),
    tsSchema,
  );
}
