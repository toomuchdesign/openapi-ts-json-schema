import filenamify from 'filenamify';
import fs from 'fs/promises';
import path from 'path';
import { patchJsonSchema, jsonSchemaToTsConst, JSONSchema } from './';

export async function generateJsonSchemaFiles({
  schemas,
  outputFolder,
  schemaPatcher,
}: {
  schemas: Record<string, JSONSchema>;
  outputFolder: string;
  schemaPatcher?: (params: { schema: JSONSchema }) => void;
}) {
  for (const schemaName in schemas) {
    const schemaNamedEscaped = filenamify(schemaName, { replacement: '|' });
    const schema = schemas[schemaName];
    const patchedSchema = patchJsonSchema(schema, schemaPatcher);
    const tsSchema = await jsonSchemaToTsConst(patchedSchema);

    await fs.mkdir(outputFolder, { recursive: true });
    await fs.writeFile(
      path.resolve(outputFolder, `${schemaNamedEscaped}.ts`),
      tsSchema,
    );
  }
}
