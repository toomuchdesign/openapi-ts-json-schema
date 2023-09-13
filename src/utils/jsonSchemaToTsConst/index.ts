import { stringify } from 'comment-json';
import { replacePlaceholdersWithImportedSchemas } from './replacePlaceholdersWithImportedSchemas';
import { formatTypeScript } from '../';
import type { SchemaMetaDataMap, SchemaMetaData } from '../../types';

export async function jsonSchemaToTsConst({
  metaData,
  schemaMetaDataMap,
}: {
  metaData: SchemaMetaData;
  schemaMetaDataMap: SchemaMetaDataMap;
}): Promise<string> {
  const { schema, schemaAbsoluteDirName } = metaData;

  /**
   * Stringifying schema with "comment-json" instead of JSON.stringify
   * to generate inline comments
   */
  const stringifiedSchema = stringify(schema, null, 2);
  let tsSchema = `export default ` + stringifiedSchema + 'as const;';

  // Placeholder will be found only on "import" refHandling
  tsSchema = replacePlaceholdersWithImportedSchemas({
    schemaAsText: tsSchema,
    schemaAbsoluteDirName,
    schemaMetaDataMap,
  });

  // Add $id named export
  tsSchema = tsSchema + `\n\nexport const $id = "${metaData.schemaId}";`;

  const formattedSchema = await formatTypeScript(tsSchema);
  return formattedSchema;
}
