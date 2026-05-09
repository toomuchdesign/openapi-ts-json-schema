import type {
  IdMapper,
  ImportExtension,
  RefHandling,
  SchemaMetaDataMap,
} from '../types.js';
import { makeTsJsonSchema } from './index.js';

/**
 * Generate the file content of all expected JSON Schema files
 */
export async function makeSchemaFileContents({
  schemaMetaDataMap,
  refHandling,
  idMapper,
  importExtension,
}: {
  schemaMetaDataMap: SchemaMetaDataMap;
  refHandling: RefHandling;
  idMapper: IdMapper;
  importExtension: ImportExtension;
}) {
  for (const [_, metaData] of schemaMetaDataMap) {
    if (metaData.shouldBeGenerated) {
      const fileContent = await makeTsJsonSchema({
        metaData,
        schemaMetaDataMap,
        refHandling,
        idMapper,
        importExtension,
      });

      metaData.fileContent = fileContent;
    }
  }
}
