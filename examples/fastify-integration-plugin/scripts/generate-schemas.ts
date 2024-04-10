import path from 'path';
import {
  openapiToTsJsonSchema,
  fastifyIntegrationPlugin,
  openApiTSCodegenPlugin,
} from '../../../src';

async function generate() {
  await openapiToTsJsonSchema({
    openApiSchema: path.resolve(
      __dirname,
      '../definitions/petstore/open-api-definition.yaml',
    ),
    definitionPathsToGenerateFrom: ['paths', 'components.schemas'],
    refHandling: 'keep',
    plugins: [
      fastifyIntegrationPlugin({
        sharedSchemasFilter: ({ id }) => id.startsWith('/components/schemas'),
      }),
      openApiTSCodegenPlugin({
        outputGeneratingPath: path.resolve(__dirname, '../api'),
      }),
    ],
  });
}

generate();
