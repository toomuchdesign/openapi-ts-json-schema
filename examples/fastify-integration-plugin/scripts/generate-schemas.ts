import { join } from 'desm';

import {
  fastifyIntegrationPlugin,
  openapiToTsJsonSchema,
} from '../../../src/index.js';

async function generate() {
  await openapiToTsJsonSchema({
    openApiDocument: join(
      import.meta.url,
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
