import prettier from 'prettier';
import { stringify } from 'comment-json';

export async function jsonSchemaToTsConst(schema: unknown): Promise<string> {
  // Stringify schema with "node-comment-json" to generate inline comments
  const stringifiedSchema = stringify(schema, null, 2);
  const tsSchema = `export default ` + stringifiedSchema + 'as const';
  const formattedSchema = await prettier.format(tsSchema, {
    parser: 'typescript',
  });

  return formattedSchema;
}
