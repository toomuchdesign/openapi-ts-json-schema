import path from 'path';
import { openapiToTsJsonSchema, fastifyTypeProviderPlugin } from '../../../src';

async function generate() {
  await openapiToTsJsonSchema({
    openApiSchema: path.resolve(
      __dirname,
      '../definitions/petstore/open-api-definition.yaml',
    ),
    definitionPathsToGenerateFrom: ['paths', 'components.schemas'],
    refHandling: 'keep',
    plugins: [
      fastifyTypeProviderPlugin({
        sharedSchemasFilter: ({ schemaId }) =>
          schemaId.startsWith('#/components/schemas'),
      }),
    ],
  });
}

generate();
