import prettier from 'prettier';
import { stringify } from 'comment-json';
import { replacePlaceholdersWithImportedSchemas } from './replacePlaceholdersWithImportedSchemas';
import type { SchemaMetaDataMap, SchemaMetaData } from '../';

export async function jsonSchemaToTsConst({
  metaData,
  schemaMetaDataMap,
}: {
  metaData: SchemaMetaData;
  schemaMetaDataMap: SchemaMetaDataMap;
}): Promise<string> {
  const { schema, schemaAbsoluteDirName } = metaData;

  // Stringify schema with "node-comment-json" to generate inline comments
  const stringifiedSchema = stringify(schema, null, 2);
  let tsSchema = `export default ` + stringifiedSchema + 'as const';

  // Related to experimentalImportRefs option
  tsSchema = replacePlaceholdersWithImportedSchemas({
    schemaAsText: tsSchema,
    schemaAbsoluteDirName,
    schemaMetaDataMap,
  });

  const formattedSchema = await prettier.format(tsSchema, {
    parser: 'typescript',
  });

  return formattedSchema;
}
