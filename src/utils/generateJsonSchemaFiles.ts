import filenamify from 'filenamify';
import fs from 'fs/promises';
import path from 'path';
import { patchJsonSchema, jsonSchemaToTsConst, JSONSchema } from './';

export async function generateJsonSchemaFiles({
  schemas,
  outputPath,
  schemaPatcher,
}: {
  schemas: Record<string, JSONSchema>;
  outputPath: string;
  schemaPatcher?: (params: { schema: JSONSchema }) => void;
}) {
  for (const schemaName in schemas) {
    const schemaNamedEscaped = filenamify(schemaName, { replacement: '|' });
    const schema = schemas[schemaName];
    const patchedSchema = patchJsonSchema(schema, schemaPatcher);
    const tsSchema = await jsonSchemaToTsConst(patchedSchema);

    await fs.mkdir(outputPath, { recursive: true });
    await fs.writeFile(
      path.resolve(outputPath, `${schemaNamedEscaped}.ts`),
      tsSchema,
    );
  }
}
