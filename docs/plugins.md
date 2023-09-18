# Plugins

## Fastify type provider plugin

This plugin generate the necessary connective tissue to optimally integrate `openapi-ts-json-schema` output with Fastify's [`json-schema-to-ts` type provider](https://github.com/fastify/fastify-type-provider-json-schema-to-ts) preserving JSON schemas `$ref`s.

The plugin generates a `fastifyTypeProvider.ts` file under `outputPath` exposing:

- `referenceSchemas`: an array containing all the `$ref` schemas found with relevant `$id` property ready to be registered with [`fastify.addSchema`](https://fastify.dev/docs/latest/Reference/Server/#addschema)
- `References` TS type specifically built to enable `json-schema-to-ts` to resolve `$ref` schema types

Generate TypeScript JSON schemas:

```ts
import {
  openapiToTsJsonSchema,
  fastifyTypeProviderPlugin,
} from 'openapi-ts-json-schema';

const { outputPath, metaData } = await openapiToTsJsonSchema({
  openApiSchema: path.resolve(fixtures, 'path/to/open-api-spec.yaml'),
  outputPath: 'path/to/generated/schemas',
  definitionPathsToGenerateFrom: ['components.schemas', 'paths'],
  refHandling: 'keep',
  plugins: [fastifyTypeProviderPlugin()],
});
```

Setup `Fastify` and `json-schema-to-ts` type provider:

```ts
import fastify from 'fastify';
import { JsonSchemaToTsProvider } from '@fastify/type-provider-json-schema-to-ts';
import {
  References,
  referenceSchemas,
} from 'path/to/generated/schemas/fastifyTypeProvider';

// Enable @fastify/type-provider-json-schema-to-ts to resolve all found `$ref` schema types
const server =
  fastify().withTypeProvider<
    JsonSchemaToTsProvider<JsonSchemaToTsProvider<{ references: References }>>
  >();

/**
 * Register `$ref` schemas individually so that they `$ref`s get resolved runtime.
 * This also enables @fastify.swagger to re-expose the schemas as shared components.
 */
referenceSchemas.forEach((schema) => {
  fastify.addSchema(schema);
});

// Reference the shared schema like the following
fastify.get(
  '/profile',
  {
    schema: {
      body: {
        type: 'object',
        properties: {
          user: {
            $ref: '#/components/schemas/User',
          },
        },
        required: ['user'],
      },
    } as const,
  },
  (req) => {
    // givenName and familyName will be correctly typed as strings!
    const { givenName, familyName } = req.body.user;
  },
);
```
