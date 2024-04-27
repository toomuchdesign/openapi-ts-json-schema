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
  RefHandling,
  $idMapper,
} from '../../types';

export async function makeTsJsonSchema({
  metaData,
  schemaMetaDataMap,
  refHandling,
  schemaPatcher,
  $idMapper,
}: {
  metaData: SchemaMetaData;
  schemaMetaDataMap: SchemaMetaDataMap;
  refHandling: RefHandling;
  schemaPatcher?: SchemaPatcher;
  $idMapper: $idMapper;
}): Promise<string> {
  const { originalSchema, absoluteDirName, $id, isRef } = metaData;

  const schemaWith$id = { $id, ...originalSchema };

  // "inline" refHandling doesn't need replacing inlined refs
  const schemaWithPlaceholders =
    refHandling === 'import' || refHandling === 'keep'
      ? replaceInlinedRefsWithStringPlaceholder(schemaWith$id)
      : schemaWith$id;

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

  let tsSchema = `
    const schema = ${stringifiedSchema} as const;
    export default schema;`;

  if (refHandling === 'import') {
    /**
     * Schemas being just a placeholder are nothing but an alias
     * of the definition found in the placeholder
     */
    if (isAlias) {
      tsSchema = `export default ` + stringifiedSchema + ';';
    }

    tsSchema = replacePlaceholdersWithImportedSchemas({
      schemaAsText: tsSchema,
      absoluteDirName,
      schemaMetaDataMap,
      isRef,
    });
  }

  if (refHandling === 'keep') {
    tsSchema = replacePlaceholdersWithRefs({
      schemaAsText: tsSchema,
      refMapper: $idMapper,
    });
  }

  const formattedSchema = await formatTypeScript(tsSchema);
  return formattedSchema;
}
