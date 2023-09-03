import fs from 'fs/promises';
import { jsonSchemaToTsConst, SchemaMetaInfoMap } from '.';

/**
 * Save TS JSON schema with the expected naming conventions
 */
export async function makeJsonSchemaFiles({
  schemas,
}: {
  schemas: SchemaMetaInfoMap;
}) {
  for (const [_, schemaMetaInfo] of schemas) {
    const tsSchema = await jsonSchemaToTsConst({
      schemaMetaInfo,
      schemas,
    });

    const { schemaAbsoluteDirName, schemaAbsolutePath } = schemaMetaInfo;
    await fs.mkdir(schemaAbsoluteDirName, { recursive: true });
    await fs.writeFile(schemaAbsolutePath, tsSchema);
  }
}
