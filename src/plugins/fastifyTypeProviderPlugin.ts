import { makeRelativePath, formatTypeScript, saveFile } from '../utils';
import type { Plugin, SchemaMetaData } from '../types';

const FILE_NAME = 'fastifyTypeProvider.ts';

const fastifyTypeProviderPlugin: Plugin =
  () =>
  async ({ outputPath, metaData }) => {
    const refSchemaMetaData: SchemaMetaData[] = [];
    metaData.schemas.forEach((schema) => {
      if (schema.isRef) {
        refSchemaMetaData.push(schema);
      }
    });

    const schemas = refSchemaMetaData.map(
      ({ schemaAbsoluteImportPath, schemaUniqueName, schemaId }) => {
        return {
          importPath: makeRelativePath({
            fromDirectory: outputPath,
            to: schemaAbsoluteImportPath,
          }),
          schemaUniqueName,
          schemaId,
        };
      },
    );

    let output = '';

    schemas.forEach((schema) => {
      output += `\n import ${schema.schemaUniqueName} from "${schema.importPath}";`;
    });

    output += '\n\n';

    schemas.forEach((schema) => {
      output += `\n const ${schema.schemaUniqueName}WithId = {...${schema.schemaUniqueName}, $id: "${schema.schemaId}"} as const;`;
    });

    // Generate a TS tuple type containing the types of all $ref schema found
    output += `\n\n
    export type References = [
      ${schemas
        .map((schema) => `typeof ${schema.schemaUniqueName}WithId`)
        .join(',')}
  ];`;

    // Generate an array af all $ref schema
    // @TODO make selected schemas configurable
    output += `\n\n
    export const referenceSchemas = [
      ${schemas.map((schema) => `${schema.schemaUniqueName}WithId`).join(',')}
  ];`;

    const formattedOutput = await formatTypeScript(output);
    await saveFile({
      path: [outputPath, FILE_NAME],
      data: formattedOutput,
    });
  };

export default fastifyTypeProviderPlugin;
