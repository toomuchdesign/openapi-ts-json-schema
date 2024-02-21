import { makeTsJsonSchema, saveFile } from '.';
import type { SchemaMetaDataMap } from '../types';

/**
 * Save TS JSON schema files with the expected naming conventions
 */
export async function makeTsJsonSchemaFiles({
  schemaMetaDataMap,
  refHandling,
}: {
  schemaMetaDataMap: SchemaMetaDataMap;
  refHandling: 'inline' | 'import' | 'keep';
}) {
  for (const [_, metaData] of schemaMetaDataMap) {
    const tsSchema = await makeTsJsonSchema({
      metaData,
      schemaMetaDataMap,
      refHandling,
    });

    const { schemaAbsolutePath } = metaData;
    await saveFile({ path: [schemaAbsolutePath], data: tsSchema });
  }
}
