import fs from 'fs/promises';
import path from 'path';
import { jsonSchemaToTsConst, SchemaMetaInfoMap } from '.';

/**
 * Save TS JSON schema with the expected naming conventions
 */
export async function makeJsonSchemaFiles({
  schemasToGenerate,
}: {
  schemasToGenerate: SchemaMetaInfoMap;
}) {
  for (const [_, schemaMetaInfo] of schemasToGenerate) {
    const tsSchema = await jsonSchemaToTsConst({
      schemaMetaInfo,
      schemasToGenerate,
    });

    const { schemaFileName, schemaAbsoluteDirName } = schemaMetaInfo;

    await fs.mkdir(schemaAbsoluteDirName, { recursive: true });
    await fs.writeFile(
      path.resolve(schemaAbsoluteDirName, `${schemaFileName}.ts`),
      tsSchema,
    );
  }
}
