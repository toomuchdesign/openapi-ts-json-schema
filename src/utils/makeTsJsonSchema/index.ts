import type {
  IdMapper,
  ModuleSystem,
  RefHandling,
  SchemaMetaData,
  SchemaMetaDataMap,
} from '../../types.js';
import { formatTypeScript } from '../index.js';
import { replaceInlinedRefsWithStringPlaceholder } from './replaceInlinedRefsWithStringPlaceholder.js';
import { replacePlaceholdersWithImportedSchemas } from './replacePlaceholdersWithImportedSchemas.js';
import { replacePlaceholdersWithRefs } from './replacePlaceholdersWithRefs.js';
import { stringify } from './stringify.js';

export async function makeTsJsonSchema({
  metaData,
  schemaMetaDataMap,
  refHandling,
  idMapper,
  moduleSystem,
}: {
  metaData: SchemaMetaData;
  schemaMetaDataMap: SchemaMetaDataMap;
  refHandling: RefHandling;
  idMapper: IdMapper;
  moduleSystem: ModuleSystem;
}): Promise<string> {
  const { originalSchema, absoluteDirName, openApiDefinition } = metaData;

  const isDeprecated =
    openApiDefinition !== undefined &&
    'deprecated' in openApiDefinition &&
    openApiDefinition.deprecated === true;

  // "inline" refHandling doesn't need replacing inlined refs
  const schemaWithPlaceholders =
    refHandling === 'import' || refHandling === 'keep'
      ? replaceInlinedRefsWithStringPlaceholder(originalSchema)
      : originalSchema;

  /**
   * Stringifying schema with "comment-json" instead of JSON.stringify
   * to generate inline comments for "inline" refHandling
   */
  const stringifiedSchema = stringify(schemaWithPlaceholders);

  const deprecatedComment = isDeprecated ? '/** @deprecated */' : '';

  let tsSchema = `
    ${deprecatedComment}
    const schema = ${stringifiedSchema} as const;
    export default schema;`;

  if (refHandling === 'import') {
    tsSchema = replacePlaceholdersWithImportedSchemas({
      schemaAsText: tsSchema,
      absoluteDirName,
      schemaMetaDataMap,
      moduleSystem,
    });
  }

  if (refHandling === 'keep') {
    tsSchema = replacePlaceholdersWithRefs({
      schemaAsText: tsSchema,
      refMapper: idMapper,
    });
  }

  const formattedSchema = await formatTypeScript(tsSchema);
  return formattedSchema;
}
