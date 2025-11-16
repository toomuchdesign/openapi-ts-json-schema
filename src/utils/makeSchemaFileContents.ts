import { makeTsJsonSchema } from '.';
import type { IdMapper, RefHandling, SchemaMetaDataMap } from '../types';

/**
 * Generate the file content of all expected JSON Schema files
 */
export async function makeSchemaFileContents({
  schemaMetaDataMap,
  refHandling,
  idMapper,
}: {
  schemaMetaDataMap: SchemaMetaDataMap;
  refHandling: RefHandling;
  idMapper: IdMapper;
}) {
  for (const [_, metaData] of schemaMetaDataMap) {
    if (metaData.shouldBeGenerated) {
      const fileContent = await makeTsJsonSchema({
        metaData,
        schemaMetaDataMap,
        refHandling,
        idMapper,
      });

      metaData.fileContent = fileContent;
    }
  }
}
