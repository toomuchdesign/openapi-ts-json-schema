# Plugins

`openapi-ts-json-schema` plugins are intended as a way to generate extra artifacts based on the same internal metadata created to generate the JSON schema output.

- [Fastify integration plugin](#fastify-integration-plugin)
- [Write your own plugin](#write-your-own-plugin)

## Fastify integration plugin

This plugin is an attempt to better integrate Fastify and its [`json-schema-to-ts` type provider](https://github.com/fastify/fastify-type-provider-json-schema-to-ts) to register schemas with `fastify.addSchema` and let `@fastify/swagger` generate a better OpenAPI definition.

The plugin generates a `<outputPath>/fastify-integration.ts` TS file exposing:

- `RefSchemas` TS type specifically built to enable `json-schema-to-ts` to resolve `$ref` schema types
- `refSchemas`: an array containing all the `$ref` schemas found provided with the relevant `$id` property necessary to register schemas with [`fastify.addSchema`](https://fastify.dev/docs/latest/Reference/Server/#addschema)
- `sharedSchemas`: an array of the extra user-picked schemas (via `sharedSchemasFilter` option) to be registered with [`fastify.addSchema`](https://fastify.dev/docs/latest/Reference/Server/#addschema) so that [`@fastify/swagger`](https://github.com/fastify/fastify-swagger) can re-export them as shared openAPI components

### Options

| Property                | Type                             | Description                                                                                                                                                                                  | Default |
| ----------------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| **sharedSchemasFilter** | `({id}: {id:string}) => boolean` | Expose a `sharedSchemas` array with extra user-selected schemas to be registered with `fastify.addSchema`. Provided function is used to filter all available non-$ref generated JSON schemas | -       |

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
      sharedSchemasFilter: ({ id }) => id.startsWith('/components/schemas'),
    }),
  ],
});
```

Register generated schemas:

```ts
import { JsonSchemaToTsProvider } from '@fastify/type-provider-json-schema-to-ts';
import {
  RefSchemas,
  refSchemas,
  sharedSchemas,
} from '.path/to/generated/schemas/fastify-integration';

// Configure json-schema-to-ts type provider to hydrate "$ref"s schema types
const server =
  fastify.withTypeProvider<
    JsonSchemaToTsProvider<{ references: RefSchemas }>
  >();

// Register `$ref` schemas individually so that they can be resolved at runtime
refSchemas.forEach((schema) => {
  server.addSchema(schema);
});

// Register all other non-`$ref` schemas to let @fastify/swagger re-export them under "components.schemas"
sharedSchemas.forEach((schema) => {
  server.addSchema(schema);
});
```

Configure `@fastify/swagger`'s [`refResolver` option](https://github.com/fastify/fastify-swagger/tree/v8.10.1#managing-your-refs):

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

Check out the [Fastify integration plugin example](../examples/fastify-integration-plugin/) to see how to setup `Fastify` and `json-schema-to-ts` type provider.

### Notes

This plugin should be considered bleeding edge. I'm still figuring out the best way to integrate `open-ts-json-schema` output with Fastify.

Please consider that `@fastify/swagger` currently comes with some limitations:

- OpenApi components being renamed as `def-${counter}` by default [🔗](https://github.com/fastify/fastify-swagger/tree/v8.10.1#managing-your-refs) (you need to configure `@fastify/swagger`'s `refResolver` option to preserve components names)
- All schemas registered via `.addSchema` being exposed under OpenAPi's `components.schemas` no matter their `$ref` value [🔗](https://github.com/fastify/fastify-swagger/blob/22d1e7c4f8cf63b0134047cdc272391d4bef3ec4/lib/spec/openapi/index.js#L23)

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
