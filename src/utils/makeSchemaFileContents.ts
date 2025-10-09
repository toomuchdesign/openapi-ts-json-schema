import { makeTsJsonSchema } from '.';
import type {
  SchemaMetaDataMap,
  SchemaPatcher,
  RefHandling,
  IdMapper,
} from '../types';

/**
 * Generate the file content of all expected JSON Schema files
 */
export async function makeSchemaFileContents({
  schemaMetaDataMap,
  refHandling,
  schemaPatcher,
  idMapper,
}: {
  schemaMetaDataMap: SchemaMetaDataMap;
  refHandling: RefHandling;
  schemaPatcher?: SchemaPatcher;
  idMapper: IdMapper;
}) {
  for (const [_, metaData] of schemaMetaDataMap) {
    if (metaData.shouldBeGenerated) {
      const fileContent = await makeTsJsonSchema({
        metaData,
        schemaMetaDataMap,
        refHandling,
        schemaPatcher,
        idMapper,
      });

      metaData.fileContent = fileContent;
    }
  }
}
