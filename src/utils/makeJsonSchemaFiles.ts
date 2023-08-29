import filenamify from 'filenamify';
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
    const { schemaName, schemaAbsoluteDirName } = schemaMetaInfo;

    const tsSchema = await jsonSchemaToTsConst({
      schemaMetaInfo,
      schemasToGenerate,
    });

    await fs.mkdir(schemaAbsoluteDirName, { recursive: true });
    const schemaNamedEscaped = filenamify(schemaName, { replacement: '|' });
    await fs.writeFile(
      path.resolve(schemaAbsoluteDirName, `${schemaNamedEscaped}.ts`),
      tsSchema,
    );
  }
}
