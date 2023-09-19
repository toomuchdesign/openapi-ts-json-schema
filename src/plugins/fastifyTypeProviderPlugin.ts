import type { Plugin } from '../types';

const FILE_NAME = 'fastify-type-provider.ts';

const fastifyTypeProviderPlugin: Plugin<
  {
    sharedSchemasFilter?: ({ schemaId }: { schemaId: string }) => boolean;
  } | void
> =
  ({ sharedSchemasFilter = () => false } = {}) =>
  async ({ outputPath, metaData, utils }) => {
    // Derive the schema data necessary to generate the declarations
    const allSchemas = [...metaData.schemas]
      .map(([id, schema]) => schema)
      .map(
        ({ schemaAbsoluteImportPath, schemaUniqueName, schemaId, isRef }) => {
          return {
            importPath: utils.makeRelativePath({
              fromDirectory: outputPath,
              to: schemaAbsoluteImportPath,
            }),
            schemaUniqueName,
            schemaId,
            isRef,
          };
        },
      );

    // Separate schemas used as $refs from the others
    const refSchemas = allSchemas.filter((schema) => schema.isRef);
    const nonRefSchemas = allSchemas.filter((schema) => !schema.isRef);
    const sharedSchemas = nonRefSchemas.filter(({ schemaId }) =>
      sharedSchemasFilter({ schemaId }),
    );

    let output = '';

    // Generate JSON schemas import statements
    [...refSchemas, ...sharedSchemas].forEach((schema) => {
      output += `\n import ${schema.schemaUniqueName} from "${schema.importPath}";`;
    });

    // Generate JSON schema objects with $id prop
    output += '\n\n';
    [...refSchemas, ...sharedSchemas].forEach((schema) => {
      output += `\n const ${schema.schemaUniqueName}WithId = {...${schema.schemaUniqueName}, $id: "${schema.schemaId}"} as const;`;
    });

    // RefSchemas type: generate TS tuple type containing the types of all $ref JSON schema
    output += `\n\n
    export type RefSchemas = [
      ${refSchemas
        .map((schema) => `typeof ${schema.schemaUniqueName}WithId`)
        .join(',')}
    ];`;

    // refSchemas: generate an array of all $ref JSON schema to be registered with `fastify.addSchema`
    output += `\n\n
    export const refSchemas = [
      ${refSchemas
        .map((schema) => `${schema.schemaUniqueName}WithId`)
        .join(',')}
    ];`;

    // sharedSchemas: generate an array of user-defined schemas to be registered with `fastify.addSchema`
    output += `\n\n
    export const sharedSchemas = [
      ${sharedSchemas
        .map((schema) => `${schema.schemaUniqueName}WithId`)
        .join(',')}
    ];`;

    // Format and save file
    const formattedOutput = await utils.formatTypeScript(output);
    await utils.saveFile({
      path: [outputPath, FILE_NAME],
      data: formattedOutput,
    });
  };

export default fastifyTypeProviderPlugin;
