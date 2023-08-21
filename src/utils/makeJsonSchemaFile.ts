import filenamify from 'filenamify';
import prettier from 'prettier';
import fs from 'fs/promises';
import path from 'path';
import {
  patchJsonSchema,
  jsonSchemaToTsConst,
  JSONSchema,
  SchemaPatcher,
  replacePlaceholdersWithImportedSchemas,
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
  replacementRefs,
}: {
  schema: JSONSchema;
  schemaName: string;
  schemaOutputPath: string;
  schemaPatcher?: SchemaPatcher;
  replacementRefs?: SchemaRecord;
}) {
  const schemaNamedEscaped = filenamify(schemaName, { replacement: '|' });
  const patchedSchema = patchJsonSchema(schema, schemaPatcher);
  let tsSchema = await jsonSchemaToTsConst(patchedSchema);

  if (replacementRefs) {
    tsSchema = replacePlaceholdersWithImportedSchemas({
      schemaAsText: tsSchema,
      replacementRefs,
      schemaOutputPath,
    });
  }

  const formattedSchema = await prettier.format(tsSchema, {
    parser: 'typescript',
  });

  await fs.mkdir(schemaOutputPath, { recursive: true });
  await fs.writeFile(
    path.resolve(schemaOutputPath, `${schemaNamedEscaped}.ts`),
    formattedSchema,
  );
}
