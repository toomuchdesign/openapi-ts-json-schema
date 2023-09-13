import { jsonSchemaToTsConst, saveFile } from '.';
import type { SchemaMetaDataMap } from '../types';

/**
 * Save TS JSON schema with the expected naming conventions
 */
export async function makeJsonSchemaFiles({
  schemaMetaDataMap,
}: {
  schemaMetaDataMap: SchemaMetaDataMap;
}) {
  for (const [_, metaData] of schemaMetaDataMap) {
    const tsSchema = await jsonSchemaToTsConst({
      metaData,
      schemaMetaDataMap,
    });

    const { schemaAbsolutePath } = metaData;
    await saveFile({ path: [schemaAbsolutePath], data: tsSchema });
  }
}
