import fs from 'fs/promises';
import { jsonSchemaToTsConst, SchemaMetaDataMap } from '.';

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

    const { schemaAbsoluteDirName, schemaAbsolutePath } = metaData;
    await fs.mkdir(schemaAbsoluteDirName, { recursive: true });
    await fs.writeFile(schemaAbsolutePath, tsSchema);
  }
}
