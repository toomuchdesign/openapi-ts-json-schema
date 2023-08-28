import filenamify from 'filenamify';
import fs from 'fs/promises';
import path from 'path';
import {
  patchJsonSchema,
  jsonSchemaToTsConst,
  SchemaPatcher,
  SchemaMetaInfoMap,
} from '.';

/**
 * Save TS JSON schema with the expected naming conventions
 */
export async function makeJsonSchemaFiles({
  schemasToGenerate,
  schemaPatcher,
}: {
  schemasToGenerate: SchemaMetaInfoMap;
  schemaPatcher?: SchemaPatcher;
}) {
  for (const [_, schemaMetaInfo] of schemasToGenerate) {
    const { schemaName, schemaAbsoluteDirName, schema } = schemaMetaInfo;
    const patchedSchema = patchJsonSchema(schema, schemaPatcher);
    const tsSchema = await jsonSchemaToTsConst({
      schema: patchedSchema,
      schemaAbsoluteDirName,
      schemasToGenerate,
    });

    await fs.mkdir(schemaAbsoluteDirName, { recursive: true });
    const schemaNamedEscaped = filenamify(schemaName, { replacement: '|' });
    await fs.writeFile(
      path.resolve(schemaAbsoluteDirName, `${schemaNamedEscaped}.ts`),
      tsSchema,
    );
  }
}
