# Plugins

`openapi-ts-json-schema` plugins are intended as a way to generate extra artifacts based on the same internal metadata created to generate the JSON schema output.

- [Fastify integration plugin](#fastify-integration-plugin)
- [Write your own plugin](#write-your-own-plugin)

## Fastify integration plugin

This plugin is an attempt to better integrate Fastify and its [`json-schema-to-ts` type provider](https://github.com/fastify/fastify-type-provider-json-schema-to-ts) with JSON schemas generated with `refHandling` === "keep", where `$ref` values are not replaced.

No plugins are needed to use Fastify's `json-schema-to-ts` type provider with `refHandling` === "inline" or "import".

The plugin generates a `<outputPath>/fastify-integration.ts` TS file exposing:

- `RefSchemas` TS type specifically built to enable `json-schema-to-ts` to resolve `$ref` schema types
- `refSchemas`: an array containing all the `$ref` schemas found provided with the relevant `$id` property necessary to register schemas with [`fastify.addSchema`](https://fastify.dev/docs/latest/Reference/Server/#addschema)
- `sharedSchemas`: an array of the extra user-selected schemas (via `sharedSchemasFilter` option) to be registered with [`fastify.addSchema`](https://fastify.dev/docs/latest/Reference/Server/#addschema) so that [`@fastify/swagger`](https://github.com/fastify/fastify-swagger) can re-export them as shared openAPI components

### Notes

This plugin should be considered bleeding edge. I'm still figuring out the best way to integrate `open-ts-json-schema` output with Fastify.

Please consider that `@fastify/swagger` currently comes with some limitations. Eg:

- no support for `$ref`s in array [🔗](https://github.com/fastify/fastify-swagger/issues/612)
- `$ref`s being renamed as `def-${counter}` [🔗](https://github.com/fastify/fastify-swagger/tree/v8.10.1#managing-your-refs)

...therefore the OpenAPI specification resulting from your Fastify application could be affected.

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
  refHandling: 'keep',
  plugins: [
    fastifyIntegrationPlugin({
      // Optional
      sharedSchemasFilter: ({ id }) => id.startsWith('/components/schemas'),
    }),
  ],
});
```

Check out the [Fastify integration plugin example](../examples/fastify-integration-plugin/) to get an idea to how to setup `Fastify` and `json-schema-to-ts` type provider.

## Write your own plugin

`openapi-ts-json-schema` exposes a TS type to support custom plugins implementation:

```ts
import type { Plugin } from 'openapi-ts-json-schema';

// An `openapi-ts-json-schema` consists of a factory function returning an async function
const myPlugin: Plugin<{ optionOne: string; optionTwo: string }> =
  // Factory function with optional options
  ({ optionOne, optionTwo }) =>
    async ({ outputPath, metaData, utils }) => {
      // Your plugin implementation...
    };

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
