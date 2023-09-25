import { stringify } from 'comment-json';
import { replacePlaceholdersWithImportedSchemas } from './replacePlaceholdersWithImportedSchemas';
import { formatTypeScript } from '../';
import type { SchemaMetaDataMap, SchemaMetaData } from '../../types';

export async function jsonSchemaToTsConst({
  metaData,
  schemaMetaDataMap,
  refHandling,
}: {
  metaData: SchemaMetaData;
  schemaMetaDataMap: SchemaMetaDataMap;
  refHandling: 'inline' | 'import' | 'keep';
}): Promise<string> {
  const { schema, schemaAbsoluteDirName } = metaData;

  /**
   * Stringifying schema with "comment-json" instead of JSON.stringify
   * to generate inline comments for "inline" refHandling
   */
  const stringifiedSchema = stringify(schema, null, 2);

  /**
   * Schemas being just a placeholder are nothing but an alias
   * of the definition found in the placeholder
   */
  const isAlias = typeof schema === 'string';
  let tsSchema =
    isAlias && refHandling === 'import'
      ? `export default ` + stringifiedSchema + ';'
      : `export default ` + stringifiedSchema + ' as const;';

  if (refHandling === 'import') {
    tsSchema = replacePlaceholdersWithImportedSchemas({
      schemaAsText: tsSchema,
      schemaAbsoluteDirName,
      schemaMetaDataMap,
    });
  }

  const formattedSchema = await formatTypeScript(tsSchema);
  return formattedSchema;
}
