# Developer's notes

## Internal schema ids

Each processed schemas is assigned with a unique internal id holding schema name and path information `/<path>/<name>`.

Eg: `/components/schemas/SchemaName`.

Internal ids are used to refer to any specific schemas and retrieve schema path and name.

## Remote $ref handling

Remote/external `$ref`s (`Pet.yaml`, `definitions.json#/Pet`) get always immediately dereferenced by fetching the specs and inlining the relevant schemas.

## `refHandling`: import

**import** `refHandling` option introduces the ability NOT to inline `$ref` schemas, but to generate the relevant import statements and reference them as external schema files.

At the time of writing the implementation is build around `@apidevtools/json-schema-ref-parser`'s `dereference` method options and works as follows:

1. Schemas get deferenced with `@apidevtools/json-schema-ref-parser`'s `dereference` method which inlines relevant `$ref` schemas
2. Inlined schemas get marked with a symbol property holding the internal schema id (`/components/schemas/Bar`)

```ts
{
  bar: {
    [Symbol('id')]: '/components/schemas/Bar',
    // ...Inlined schema props
  }
}
```

1. Inlined and dereferenced schemas get traversed and all schemas marked with `Symbol('id')` prop get replaced with a **string placeholder** holding the original internal schema id. Note that string placeholders can be safely stringified.

```ts
{
  bar: '_OTJS-START_/components/schemas/Bar_OTJS-END_';
}
```

Note: alias definitions (eg. `Foo: "#components/schemas/Bar"`) will result in a plain **string placeholder**.

```ts
'_OTJS-START_/components/schemas/Bar_OTJS-END_';
```

1. Inlined and dereferenced schemas get stringified and parsed to retrieve **string placeholders** and their internal id value

2. For each **string placeholder** found, an import statement to the relevant `$ref` schema is prepended and the placeholder replaced with the imported schema name.

```ts
import Bar from '../foo/Bar';

export default {
  bar: Bar;
} as const
```

## `refHandling`: keep

`keep` option was implemented as last, and it currently follows the same flow as the `import` except for point 5, where schemas with **string placeholders** are replaced with the an actual `$ref` value.

## OpenAPI $ref vs JSON schema $id

- [OpenAPI `$ref`s documentation](https://swagger.io/docs/specification/using-ref/)
- [JSON schema `$ref`s documentation](https://json-schema.org/understanding-json-schema/structuring.html#ref)
- [JSON schema Compound Schema Document `$id` documentation](https://json-schema.org/understanding-json-schema/structuring.html#bundling)

JSON schemas are currently generated without an `$id` prop. `$id`s can currently be generates via plugins (see Fastify integration plugin).

Schemas are internally assigned to a private id with the following structure: `/components/schemas/MySchema`.

We could expose an option to append `$id` props to the generated schemas: this would clash with import `refHandling`, unless we find a way to import schemas with and without `$id`.

## TypeScript cannot import json as const

We are currently forced to generate `.ts` files with `as const` assertions since [TypeScript cannot import JSON or any other file as const](https://github.com/ThomasAribart/json-schema-to-ts/blob/v2.10.0/documentation/FAQs/does-json-schema-to-ts-work-on-json-file-schemas.md).

In [this GitHub thread](https://github.com/microsoft/TypeScript/issues/32063), TypeScript maintainers discuss the topic in depth.

## Handling multiple OpenApi definitions

There are currently at least 2 open points regarding handling multiple OpenApi definition files:

- External `#ref`s being inlined and possibly duplicated, loosing ability to reference shared components
- Merge multiple different OpenApi definitions consistently.

External `$ref`s are currently inlined with `@apidevtools/json-schema-ref-parser`'s `bundle` method. We should investigate whether any OpenApi-specific library could provide a more flexible alternative:

- [openapi-merger](https://github.com/kota65535/openapi-merger)
- [swagger-merger](https://github.com/WindomZ/swagger-merger)
- [swagger-combine](https://github.com/maxdome/swagger-combine)
- [openapi-merge](https://github.com/robertmassaioli/openapi-merge)
- [api-ref-resolver](https://github.com/apiture/api-ref-resolver)
- [@iouring-engineering/openapi-merge](https://github.com/iouring-engineering/openapi-merge)
- [@stoplight/json-ref-resolver](https://www.npmjs.com/package/@stoplight/json-ref-resolver)

## Debugging tests

Comment [this line](https://github.com/toomuchdesign/openapi-ts-json-schema/blob/master/vitest.setup.mts#L17) out to disable schemas cleanup after tests and check the generated files.

## AJV TS support

AVJ doesn't support implicit data validation and type inference, yet.

- https://github.com/ajv-validator/ajv/issues/2398
- https://github.com/ajv-validator/ajv/issues/2091

## OpenApi to JSON schema conversion

OpenAPI is often described as an extension of JSON Schema, but both specs have changed over time and grown independently:

- https://medium.com/apis-you-wont-hate/openapi-and-json-schema-divergence-part-1-1daf6678d86e
- https://medium.com/apis-you-wont-hate/openapi-and-json-schema-divergence-part-2-52e282e06a05

The current conversion consists of iterating the whole OpenApi schema and converting any found property with `@openapi-contrib/openapi-schema-to-json-schema`. This approach is definitely suboptimal since not all the OpenApi fields are supposed to be convertible to JSON schema.

Another approach could consist of executing the conversion only on those fields which [OpenApi documentation](https://swagger.io/resources/open-api/) defines as data types convertible to JSON schema.

From v3.1.0, OpenApi definitions should be valid JSON schemas, therefore no conversion should ve needed.
