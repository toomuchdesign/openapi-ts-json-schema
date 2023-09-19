import type { Plugin, SchemaMetaData } from '../types';

const FILE_NAME = 'fastifyTypeProvider.ts';

const fastifyTypeProviderPlugin: Plugin =
  () =>
  async ({ outputPath, metaData, utils }) => {
    // Meta data of the schemas used as $refs
    const refSchemaMetaData = [...metaData.schemas]
      .filter(([id, schema]) => schema.isRef)
      .map(([id, schema]) => schema);

    const refSchemas = refSchemaMetaData.map(
      ({ schemaAbsoluteImportPath, schemaUniqueName, schemaId }) => {
        return {
          importPath: utils.makeRelativePath({
            fromDirectory: outputPath,
            to: schemaAbsoluteImportPath,
          }),
          schemaUniqueName,
          schemaId,
        };
      },
    );

    // Generate $ref JSON refSchemas import statements
    let output = '';
    refSchemas.forEach((schema) => {
      output += `\n import ${schema.schemaUniqueName} from "${schema.importPath}";`;
    });

    // Generate $ref JSON schema objects with $id prop
    output += '\n\n';
    refSchemas.forEach((schema) => {
      output += `\n const ${schema.schemaUniqueName}WithId = {...${schema.schemaUniqueName}, $id: "${schema.schemaId}"} as const;`;
    });

    // RefSchemas type: generate TS tuple type containing the types of all $ref JSON schema
    output += `\n\n
    export type RefSchemas = [
      ${refSchemas
        .map((schema) => `typeof ${schema.schemaUniqueName}WithId`)
        .join(',')}
    ];`;

    // refSchemas: generate an array of all $ref JSON schema
    output += `\n\n
    export const refSchemas = [
      ${refSchemas
        .map((schema) => `${schema.schemaUniqueName}WithId`)
        .join(',')}
    ];`;

    // @TODO Add a way to append to refSchemas a configurable set of other schemas

    // Format and save file
    const formattedOutput = await utils.formatTypeScript(output);
    await utils.saveFile({
      path: [outputPath, FILE_NAME],
      data: formattedOutput,
    });
  };

export default fastifyTypeProviderPlugin;
