import prettier from 'prettier';
import { stringify } from 'comment-json';
import { replacePlaceholdersWithImportedSchemas } from './replacePlaceholdersWithImportedSchemas';
import type { SchemaRecord } from '../';

export async function jsonSchemaToTsConst({
  schema,
  schemaOutputPath,
  replacementRefs,
}: {
  schema: unknown;
  schemaOutputPath: string;
  replacementRefs?: SchemaRecord;
}): Promise<string> {
  // Stringify schema with "node-comment-json" to generate inline comments
  const stringifiedSchema = stringify(schema, null, 2);
  let tsSchema = `export default ` + stringifiedSchema + 'as const';

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

  return formattedSchema;
}
