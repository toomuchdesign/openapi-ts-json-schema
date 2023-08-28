import prettier from 'prettier';
import { stringify } from 'comment-json';
import { replacePlaceholdersWithImportedSchemas } from './replacePlaceholdersWithImportedSchemas';
import type { InlinedRefs, SchemaMetaInfoMap } from '../';

export async function jsonSchemaToTsConst({
  schema,
  schemaAbsoluteDirName,
  inlinedRefs,
  schemasToGenerate,
}: {
  schema: unknown;
  schemaAbsoluteDirName: string;
  inlinedRefs?: InlinedRefs;
  schemasToGenerate: SchemaMetaInfoMap;
}): Promise<string> {
  // Stringify schema with "node-comment-json" to generate inline comments
  const stringifiedSchema = stringify(schema, null, 2);
  let tsSchema = `export default ` + stringifiedSchema + 'as const';

  if (inlinedRefs && inlinedRefs.size > 0) {
    tsSchema = replacePlaceholdersWithImportedSchemas({
      schemaAsText: tsSchema,
      schemaAbsoluteDirName,
      schemasToGenerate,
    });
  }

  const formattedSchema = await prettier.format(tsSchema, {
    parser: 'typescript',
  });

  return formattedSchema;
}
