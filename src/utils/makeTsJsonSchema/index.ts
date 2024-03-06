import { stringify } from 'comment-json';
import { replaceInlinedRefsWithStringPlaceholder } from './replaceInlinedRefsWithStringPlaceholder';
import { replacePlaceholdersWithImportedSchemas } from './replacePlaceholdersWithImportedSchemas';
import { replacePlaceholdersWithRefs } from './replacePlaceholdersWithRefs';
import { makeCircularRefReplacer } from './makeCircularRefReplacer';
import { patchJsonSchema } from './patchJsonSchema';
import { formatTypeScript } from '../';
import type {
  SchemaMetaDataMap,
  SchemaMetaData,
  SchemaPatcher,
} from '../../types';

export async function makeTsJsonSchema({
  metaData,
  schemaMetaDataMap,
  refHandling,
  schemaPatcher,
}: {
  metaData: SchemaMetaData;
  schemaMetaDataMap: SchemaMetaDataMap;
  refHandling: 'inline' | 'import' | 'keep';
  schemaPatcher?: SchemaPatcher;
}): Promise<string> {
  const { originalSchema, absoluteDirName } = metaData;

  // "inline" refHandling doesn't need replacing inlined refs
  const schemaWithPlaceholders =
    refHandling === 'import' || refHandling === 'keep'
      ? replaceInlinedRefsWithStringPlaceholder(originalSchema)
      : originalSchema;

  // Check if this schema is just the reference to another schema
  const isAlias = typeof schemaWithPlaceholders === 'string';

  const patchedSchema = isAlias
    ? schemaWithPlaceholders
    : patchJsonSchema(schemaWithPlaceholders, schemaPatcher);

  /**
   * Stringifying schema with "comment-json" instead of JSON.stringify
   * to generate inline comments for "inline" refHandling
   */
  const stringifiedSchema = stringify(
    patchedSchema,
    makeCircularRefReplacer(),
    2,
  );

  /**
   * Schemas being just a placeholder are nothing but an alias
   * of the definition found in the placeholder
   */
  let tsSchema =
    isAlias && refHandling === 'import'
      ? `export default ` + stringifiedSchema + ';'
      : `export default ` + stringifiedSchema + ' as const;';

  if (refHandling === 'import') {
    tsSchema = replacePlaceholdersWithImportedSchemas({
      schemaAsText: tsSchema,
      absoluteDirName,
      schemaMetaDataMap,
    });
  }

  if (refHandling === 'keep') {
    tsSchema = replacePlaceholdersWithRefs({
      schemaAsText: tsSchema,
    });
  }

  const formattedSchema = await formatTypeScript(tsSchema);
  return formattedSchema;
}
