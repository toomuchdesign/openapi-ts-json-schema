# Plugins

`openapi-ts-json-schema` plugins are intended as a way to generate extra artifacts based on the same internal metadata created to generate the JSON schema output.

- [Fastify integration plugin](#fastify-integration-plugin)
- [Write your own plugin](#write-your-own-plugin)

## Generate schema with $id plugin

Generate and extra named export exposing the same schema with the [`$id` JSON Schema prop](https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-00#rfc.section.8.2.1).

### Example

```ts
import {
  openapiToTsJsonSchema,
  generateSchemaWith$idPlugin,
} from 'openapi-ts-json-schema';

await openapiToTsJsonSchema({
  openApiSchema: path.resolve(fixtures, 'path/to/open-api-specs.yaml'),
  outputPath: 'path/to/generated/schemas',
  definitionPathsToGenerateFrom: ['components.schemas', 'paths'],
  plugins: [generateSchemaWith$idPlugin()],
});
```

## Fastify integration plugin

This plugin is an attempt to better integrate Fastify and its [`json-schema-to-ts` type provider](https://github.com/fastify/fastify-type-provider-json-schema-to-ts) to register schemas with `fastify.addSchema` and let `@fastify/swagger` generate a better OpenAPI definition.

The plugin generates a `<outputPath>/fastify-integration.ts` TS file exposing:

- `RefSchemas` TS type specifically built to enable `json-schema-to-ts` to resolve `$ref` schema types
- `schemas`: an array containing all `$ref` schemas and user-picked schemas (via `schemaFilter` option) to be registered with [`fastify.addSchema`](https://fastify.dev/docs/latest/Reference/Server/#addschema) so that [`@fastify/swagger`](https://github.com/fastify/fastify-swagger) can re-export them as `components.schemas` OpenAPI definitions

### Options

| Property         | Type                                             | Description                                            | Default                              |
| ---------------- | ------------------------------------------------ | ------------------------------------------------------ | ------------------------------------ |
| **schemaFilter** | `({id}: {id:string, isRef: boolean}) => boolean` | Pick the schemas to register with `fastify.addSchema`. | All `components.schemas` definitions |

### Example

Generate TypeScript JSON schemas:

```ts
import {
  openapiToTsJsonSchema,
  fastifyIntegrationPlugin,
} from 'openapi-ts-json-schema';

await openapiToTsJsonSchema({
  openApiSchema: path.resolve(fixtures, 'path/to/open-api-specs.yaml'),
  outputPath: 'path/to/generated/schemas',
  definitionPathsToGenerateFrom: ['components.schemas', 'paths'],
  plugins: [
    fastifyIntegrationPlugin({
      // Optional
      schemaFilter: ({ id }) => id.startsWith('/components/schemas'),
    }),
  ],
});
```

Register generated schemas:

```ts
import { JsonSchemaToTsProvider } from '@fastify/type-provider-json-schema-to-ts';
import {
  RefSchemas,
  schemas,
} from '.path/to/generated/schemas/fastify-integration';

// Configure json-schema-to-ts type provider to hydrate "$ref"s schema types
const server =
  fastify.withTypeProvider<
    JsonSchemaToTsProvider<{ references: RefSchemas }>
  >();

// Register exposed JSON schemas
schemas.forEach((schema) => {
  server.addSchema(schema);
});
```

Configure `@fastify/swagger`'s [`refResolver` option](https://github.com/fastify/fastify-swagger/tree/v8.10.1#managing-your-refs) to re-export registered schemas under OpenAPI `components.schema` prop:

```ts
await server.register(fastifySwagger, {
  openapi: {
    /*...*/
  },
  refResolver: {
    buildLocalReference: (json, baseUri, fragment, i) => {
      const OPEN_API_COMPONENTS_SCHEMAS_PATH = '/components/schemas/';
      if (
        typeof json.$id === 'string' &&
        json.$id.startsWith(OPEN_API_COMPONENTS_SCHEMAS_PATH)
      ) {
        return json.$id.replace(OPEN_API_COMPONENTS_SCHEMAS_PATH, '');
      }

      return `def-${i}`;
    },
  },
});
```

Reference registered schemas as:

```ts
server.get('/pet', {
  schema: {
    response: {
      200: { $ref: '/components/schemas/Pets' },
    },
  } as const,
  handler: (req) => {
    return [
      {
        id,
        name: 'Pet name',
        tag: '3',
      },
    ];
  },
});
```

Check out the [Fastify integration plugin example](../examples/fastify-integration-plugin/) to see how to setup `Fastify` and `json-schema-to-ts` type provider.

### Notes

This plugin should be considered bleeding edge. I'm still figuring out the best way to integrate `open-ts-json-schema` output with Fastify.

Please consider that `@fastify/swagger` currently comes with some limitations:

- OpenApi components being renamed as `def-${counter}` by default [🔗](https://github.com/fastify/fastify-swagger/tree/v8.10.1#managing-your-refs) (you need to configure `@fastify/swagger`'s `refResolver` option to preserve components names)
- All schemas registered via `.addSchema` being exposed under OpenAPi's `components.schemas` no matter their `$ref` value [🔗](https://github.com/fastify/fastify-swagger/blob/22d1e7c4f8cf63b0134047cdc272391d4bef3ec4/lib/spec/openapi/index.js#L23)
- Fastify seems not to be always able to resolve `#`-leading `$ref`s (`#/components/schemas/Name`) but only `/components/schemas/Name`. For this reason the plugin rewrites `$id` and `$ref` values as the latter

## Write your own plugin

`openapi-ts-json-schema` exposes a TS type to support custom plugins implementation:

```ts
import type { Plugin } from 'openapi-ts-json-schema';

// An `openapi-ts-json-schema` consists of a factory function returning an async function
const myPlugin: Plugin<{ optionOne: string; optionTwo: string }> =
  // Factory function with optional options
  ({ optionOne, optionTwo }) => ({
    onInit: async ({ options }) => {
      // Validate/mutate option values here
    };
    onBeforeGeneration: async ({ outputPath, metaData, options, utils }) => {
      // Generate plugin-specific artifacts
    };
  })

export myPlugin;
```

...import and instantiate your plugin:

```ts
import { openapiToTsJsonSchema } from 'openapi-ts-json-schema';
import { myPlugin } from '../myPlugin';

await openapiToTsJsonSchema({
  openApiSchema: 'path/to/open-api-specs.yaml',
  definitionPathsToGenerateFrom: ['components.schemas'],
  plugins: [myPlugin({ optionOne: 'foo', optionTwo: 'bar' })],
});
```

Take a look at [`fastifyIntegrationPlugin`](../src/plugins/fastifyIntegrationPlugin.ts) to get an idea.
