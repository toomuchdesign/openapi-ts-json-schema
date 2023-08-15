import filenamify from 'filenamify';
import fs from 'fs/promises';
import path from 'path';
import {
  patchJsonSchema,
  jsonSchemaToTsConst,
  JSONSchema,
  SchemaPatcher,
} from './';

/**
 * Save TS JSON schema with the expected naming conventions
 */
export async function makeJsonSchemaFile({
  schema,
  schemaName,
  outputPath,
  schemaPatcher,
}: {
  schema: JSONSchema;
  schemaName: string;
  outputPath: string;
  schemaPatcher?: SchemaPatcher;
}) {
  const schemaNamedEscaped = filenamify(schemaName, { replacement: '|' });
  const patchedSchema = patchJsonSchema(schema, schemaPatcher);
  const tsSchema = await jsonSchemaToTsConst(patchedSchema);

  await fs.mkdir(outputPath, { recursive: true });
  await fs.writeFile(
    path.resolve(outputPath, `${schemaNamedEscaped}.ts`),
    tsSchema,
  );
}
