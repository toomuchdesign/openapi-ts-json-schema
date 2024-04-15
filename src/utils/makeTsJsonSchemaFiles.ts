import { makeTsJsonSchema, saveFile } from '.';
import type { SchemaMetaDataMap, SchemaPatcher, RefHandling } from '../types';

/**
 * Save TS JSON schema files with the expected naming conventions
 */
export async function makeTsJsonSchemaFiles({
  schemaMetaDataMap,
  refHandling,
  schemaPatcher,
}: {
  schemaMetaDataMap: SchemaMetaDataMap;
  refHandling: RefHandling;
  schemaPatcher?: SchemaPatcher;
}) {
  for (const [_, metaData] of schemaMetaDataMap) {
    const tsSchema = await makeTsJsonSchema({
      metaData,
      schemaMetaDataMap,
      refHandling,
      schemaPatcher,
    });

    const { absolutePath } = metaData;
    await saveFile({ path: [absolutePath], data: tsSchema });
  }
}
