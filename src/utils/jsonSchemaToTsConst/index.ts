import prettier from 'prettier';
import { stringify } from 'comment-json';
import { replacePlaceholdersWithImportedSchemas } from './replacePlaceholdersWithImportedSchemas';
import type { SchemaMetaInfoMap, SchemaMetaInfo } from '../';

export async function jsonSchemaToTsConst({
  schemaMetaInfo,
  schemas,
}: {
  schemaMetaInfo: SchemaMetaInfo;
  schemas: SchemaMetaInfoMap;
}): Promise<string> {
  const { schema, schemaAbsoluteDirName } = schemaMetaInfo;

  // Stringify schema with "node-comment-json" to generate inline comments
  const stringifiedSchema = stringify(schema, null, 2);
  let tsSchema = `export default ` + stringifiedSchema + 'as const';

  // Related to experimentalImportRefs option
  tsSchema = replacePlaceholdersWithImportedSchemas({
    schemaAsText: tsSchema,
    schemaAbsoluteDirName,
    schemas,
  });

  const formattedSchema = await prettier.format(tsSchema, {
    parser: 'typescript',
  });

  return formattedSchema;
}
