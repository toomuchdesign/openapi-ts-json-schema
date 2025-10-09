import { saveFile } from '.';
import type { SchemaMetaDataMap } from '../types';

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
