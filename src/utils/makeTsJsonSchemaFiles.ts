import { makeTsJsonSchema, saveFile } from '.';
import type {
  SchemaMetaDataMap,
  SchemaPatcher,
  RefHandling,
  $idMapper,
} from '../types';

/**
 * Save TS JSON schema files with the expected naming conventions
 */
export async function makeTsJsonSchemaFiles({
  schemaMetaDataMap,
  refHandling,
  schemaPatcher,
  $idMapper,
}: {
  schemaMetaDataMap: SchemaMetaDataMap;
  refHandling: RefHandling;
  schemaPatcher?: SchemaPatcher;
  $idMapper: $idMapper;
}) {
  for (const [_, metaData] of schemaMetaDataMap) {
    if (metaData.shouldBeGenerated) {
      const tsSchema = await makeTsJsonSchema({
        metaData,
        schemaMetaDataMap,
        refHandling,
        schemaPatcher,
        $idMapper,
      });

      const { absolutePath } = metaData;
      await saveFile({ path: [absolutePath], data: tsSchema });
    }
  }
}
