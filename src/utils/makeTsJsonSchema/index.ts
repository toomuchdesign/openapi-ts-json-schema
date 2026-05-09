import type {
  IdMapper,
  ImportExtension,
  RefHandling,
  SchemaMetaData,
  SchemaMetaDataMap,
} from '../../types.js';
import { formatTypeScript } from '../index.js';
import { emitTsSchema } from './emitTsSchema.js';

export async function makeTsJsonSchema({
  metaData,
  schemaMetaDataMap,
  refHandling,
  idMapper,
  importExtension,
}: {
  metaData: SchemaMetaData;
  schemaMetaDataMap: SchemaMetaDataMap;
  refHandling: RefHandling;
  idMapper: IdMapper;
  importExtension: ImportExtension;
}): Promise<string> {
  const { originalSchema, absoluteDirName, openApiDefinition } = metaData;

  const isDeprecated =
    openApiDefinition !== undefined &&
    'deprecated' in openApiDefinition &&
    openApiDefinition.deprecated === true;

  const { body, imports, isImportAlias } = emitTsSchema({
    rootSchema: originalSchema,
    refHandling,
    schemaMetaDataMap,
    absoluteDirName,
    importExtension,
    idMapper,
  });

  const deprecatedComment = isDeprecated ? '/** @deprecated */' : '';
  // Skip "as const" when the file just re-exports an imported identifier
  const constSuffix = isImportAlias ? '' : ' as const';

  const tsSchema = `${imports}
    ${deprecatedComment}
    const schema = ${body}${constSuffix};
    export default schema;`;

  return formatTypeScript(tsSchema);
}
