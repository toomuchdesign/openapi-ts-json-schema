import { stringify } from 'comment-json';
import { replacePlaceholdersWithImportedSchemas } from './replacePlaceholdersWithImportedSchemas';
import { replacePlaceholdersWithRefs } from './replacePlaceholdersWithRefs';
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
  let tsSchema = `export default ` + stringifiedSchema + ' as const;';

  if (refHandling === 'import') {
    tsSchema = replacePlaceholdersWithImportedSchemas({
      schemaAsText: tsSchema,
      schemaAbsoluteDirName,
      schemaMetaDataMap,
    });
  }

  if (refHandling === 'keep') {
    tsSchema = replacePlaceholdersWithRefs({
      schemaAsText: tsSchema,
    });
  }

  // Add $id named export
  tsSchema = tsSchema + `\n\nexport const $id = "${metaData.schemaId}";`;

  const formattedSchema = await formatTypeScript(tsSchema);
  return formattedSchema;
}
