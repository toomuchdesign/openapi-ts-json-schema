import type {
  IdMapper,
  ModuleSystem,
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
  moduleSystem,
}: {
  schemaMetaDataMap: SchemaMetaDataMap;
  refHandling: RefHandling;
  idMapper: IdMapper;
  moduleSystem: ModuleSystem;
}) {
  for (const [_, metaData] of schemaMetaDataMap) {
    if (metaData.shouldBeGenerated) {
      const fileContent = await makeTsJsonSchema({
        metaData,
        schemaMetaDataMap,
        refHandling,
        idMapper,
        moduleSystem,
      });

      metaData.fileContent = fileContent;
    }
  }
}
