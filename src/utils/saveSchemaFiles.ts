import type { SchemaMetaDataMap } from '../types.js';
import { saveFile } from './index.js';

export async function saveSchemaFiles({
  schemaMetaDataMap,
}: {
  schemaMetaDataMap: SchemaMetaDataMap;
}) {
  for (const [_, metaData] of schemaMetaDataMap) {
    if (metaData.shouldBeGenerated && metaData.fileContent) {
      await saveFile({
        path: [metaData.absolutePath],
        data: metaData.fileContent,
      });
    }
  }
}
