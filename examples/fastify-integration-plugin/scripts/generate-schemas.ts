import path from 'path';
import { openapiToTsJsonSchema, fastifyIntegrationPlugin } from '../../../src';

async function generate() {
  await openapiToTsJsonSchema({
    openApiDocument: path.resolve(
      __dirname,
      '../definitions/petstore/open-api-definition.yaml',
    ),
    definitionPathsToGenerateFrom: ['paths', 'components.schemas'],
    plugins: [
      fastifyIntegrationPlugin({
        schemaFilter: ({ id }) => id.startsWith('/components/schemas'),
      }),
    ],
  });
}

generate();
