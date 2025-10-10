import type { Plugin } from '../types';

type PluginOptions = {};

const generateSchemaWith$idPlugin: Plugin<PluginOptions | void> = () => ({
  onBeforeSaveFile: async ({ metaData, utils }) => {
    for (const [_id, schema] of metaData.schemas) {
      if (schema.fileContent) {
        /**
         * Re-expose schema with $id as "with$id"
         */
        schema.fileContent = await utils.formatTypeScript(
          schema.fileContent +
            '\n\n' +
            `const with$id = { $id: "${schema.$id}", ...schema } as const` +
            '\n' +
            `export { with$id };`,
        );
      }
    }
  },
});

export default generateSchemaWith$idPlugin;
