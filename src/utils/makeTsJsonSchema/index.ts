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
  const { originalSchema, absoluteDirName } = metaData;

  // "inline" refHandling doesn't need replacing inlined refs
  const schemaWithPlaceholders =
    refHandling === 'import' || refHandling === 'keep'
      ? replaceInlinedRefsWithStringPlaceholder(originalSchema)
      : originalSchema;

  /**
   * Check if this schema is just a reference to another schema
   * Eg: _OTJS-START_/components/schemas/Foo_OTJS-END_
   */
  const isAlias = typeof schemaWithPlaceholders === 'string';

  /**
   * Stringifying schema with "comment-json" instead of JSON.stringify
   * to generate inline comments for "inline" refHandling
   */
  const stringifiedSchema = stringify(schemaWithPlaceholders);

  let tsSchema = `
    const schema = ${stringifiedSchema} as const;
    export default schema;`;

  if (refHandling === 'import') {
    // Alias schema handling is a bit rough, right now
    if (isAlias) {
      tsSchema = `
        const schema = ${stringifiedSchema};
        export default schema;`;
    }

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
