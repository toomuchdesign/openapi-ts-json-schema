import { jsonSchemaToTsConst, saveFile } from '.';
import type { SchemaMetaDataMap } from '../types';

/**
 * Save TS JSON schema with the expected naming conventions
 */
export async function makeJsonSchemaFiles({
  schemaMetaDataMap,
  refHandling,
}: {
  schemaMetaDataMap: SchemaMetaDataMap;
  refHandling: 'inline' | 'import' | 'keep';
}) {
  for (const [_, metaData] of schemaMetaDataMap) {
    const tsSchema = await jsonSchemaToTsConst({
      metaData,
      schemaMetaDataMap,
      refHandling,
    });

    const { schemaAbsolutePath } = metaData;
    await saveFile({ path: [schemaAbsolutePath], data: tsSchema });
  }
}
