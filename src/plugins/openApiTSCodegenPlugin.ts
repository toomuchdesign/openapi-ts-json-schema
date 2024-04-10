import type { Plugin } from '../types';
const OpenAPI = require('openapi-typescript-codegen');

const openApiTSCodegenPlugin: Plugin<
  { outputGeneratingPath?: string } | void
> =
  ({ outputGeneratingPath = '' } = {}) =>
  async ({ outputPath, schemaPath, metaData, utils }) => {
    // Derive the schema data necessary to generate the declarations
    console.log('schemaPath', schemaPath);
    const resultPath = outputGeneratingPath || outputPath;
    console.log('outputPath', resultPath);
    OpenAPI.generate({
      input: schemaPath,
      output: resultPath,
    });
  };

export default openApiTSCodegenPlugin;
