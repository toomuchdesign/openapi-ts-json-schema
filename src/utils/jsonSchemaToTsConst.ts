import prettier from 'prettier';

export async function jsonSchemaToTsConst(schema: unknown): Promise<string> {
  const tsSchema = `export default ` + JSON.stringify(schema) + 'as const';

  const formattedSchema = await prettier.format(tsSchema, {
    parser: 'typescript',
  });

  return formattedSchema;
}
