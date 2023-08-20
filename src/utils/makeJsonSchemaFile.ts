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
} from './';

/**
 * Save TS JSON schema with the expected naming conventions
 */
export async function makeJsonSchemaFile({
  schema,
  schemaName,
  schemaOutputPath,
  outputPath,
  schemaPatcher,
  replacementRefs,
}: {
  schema: JSONSchema;
  schemaName: string;
  schemaOutputPath: string;
  outputPath: string;
  schemaPatcher?: SchemaPatcher;
  replacementRefs?: Map<string, JSONSchema>;
}) {
  const schemaNamedEscaped = filenamify(schemaName, { replacement: '|' });
  const patchedSchema = patchJsonSchema(schema, schemaPatcher);
  let tsSchema = await jsonSchemaToTsConst(patchedSchema);

  if (replacementRefs) {
    tsSchema = replacePlaceholdersWithImportedSchemas({
      schemaAsText: tsSchema,
      replacementRefs,
      schemaOutputPath,
      outputPath,
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
