# Plugins

`openapi-ts-json-schema` plugins are intended as a way to generate extra artifacts based on the same internal metadata created to generate the JSON schema output.

- [Fastify type provider plugin](#fastify-type-provider-plugin)
- [Write your own plugin](#write-your-own-plugin)

## Fastify type provider plugin

This plugin is an attempt to better integrate Fastify and its [`json-schema-to-ts` type provider](https://github.com/fastify/fastify-type-provider-json-schema-to-ts) with JSON schemas generated with `refHandling` === "keep", where `$ref` values are not replaced.

No plugins are needed to use Fastify's `json-schema-to-ts` type provider with `refHandling` === "inline" or "import".

The plugin generates a `<outputPath>/fastify-type-provider.ts.ts` TS file exposing:

- `RefSchemas` TS type specifically built to enable `json-schema-to-ts` to resolve `$ref` schema types
- `refSchemas`: an array containing all the `$ref` schemas found provided with the relevant `$id` property necessary to register schemas with [`fastify.addSchema`](https://fastify.dev/docs/latest/Reference/Server/#addschema)
- `sharedSchemas`: an array of the extra user-selected schemas (via `sharedSchemasFilter` option) to be registered with [`fastify.addSchema`](https://fastify.dev/docs/latest/Reference/Server/#addschema) so that [`@fastify/swagger`](https://github.com/fastify/fastify-swagger) can re-export them as shared openAPI components

### Notes

Please consider that `@fastify/swagger` currently comes with some limitions. Eg:

- no support for `$ref`s in array [🔗](https://github.com/fastify/fastify-swagger/issues/612)
- `$ref`s being renamed as `def-${counter}` [🔗](https://github.com/fastify/fastify-swagger/tree/v8.10.1#managing-your-refs)

### Options

| Property                | Type                                         | Description                                                                                                                                                                                  | Default |
| ----------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| **sharedSchemasFilter** | `({schemaId}: {schemaId:string}) => boolean` | Expose a `sharedSchemas` array with extra user-selected schemas to be registered with `fastify.addSchema`. Provided function is used to filter all available non-$ref generated JSON schemas | -       |

### Example

Generate TypeScript JSON schemas:

```ts
import {
  openapiToTsJsonSchema,
  fastifyTypeProviderPlugin,
} from 'openapi-ts-json-schema';

await openapiToTsJsonSchema({
  openApiSchema: path.resolve(fixtures, 'path/to/open-api-spec.yaml'),
  outputPath: 'path/to/generated/schemas',
  definitionPathsToGenerateFrom: ['components.schemas', 'paths'],
  refHandling: 'keep',
  plugins: [
    fastifyTypeProviderPlugin({
      // Optional
      sharedSchemasFilter: ({ schemaId }) =>
        schemaId.startsWith('#/components/schemas'),
    }),
  ],
});
```

Setup `Fastify` and `json-schema-to-ts` type provider:

```ts
import fastify from 'fastify';
import { JsonSchemaToTsProvider } from '@fastify/type-provider-json-schema-to-ts';
import {
  RefSchemas,
  refSchemas,
  sharedSchemas,
} from 'path/to/generated/schemas/fastify-type-provider.ts';

// Enable @fastify/type-provider-json-schema-to-ts to resolve all found `$ref` schema types
const server =
  fastify().withTypeProvider<
    JsonSchemaToTsProvider<{ references: RefSchemas }>
  >();

// Register `$ref` schemas individually so that they `$ref`s get resolved runtime.
refSchemas.forEach((schema) => {
  fastify.addSchema(schema);
});

// Register other schemas to let @fastify.swagger re-export them as shared openAPI components
sharedSchemas.forEach((schema) => {
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

Take a look at [`fastifyTypeProviderPlugin` implementation](../src/plugins/fastifyTypeProviderPlugin.ts) to get an idea.
