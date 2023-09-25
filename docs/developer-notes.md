# Developer's notes

## Remote $ref handling

Remote/external `$ref`s (`Pet.yaml`, `definitions.json#/Pet`) get always immediately dereferenced by fetching the specs and inlining the relevant schemas.

## `refHandling`: import

**import** `refHandling` option introduces the ability NOT to inline `$ref` schemas, but to generate the relevant import statements and reference them as external schema files.

At the time of writing the implementation is build around `@apidevtools/json-schema-ref-parser`'s `dereference` method options and works as follows:

1. Schemas get deferenced with `@apidevtools/json-schema-ref-parser`'s `dereference` method which inlines relevant `$ref` schemas
2. Inlined schemas get marked with a symbol property holding the original `$ref` value (`#/foo/Bar`)

```ts
{
  bar: {
    [Symbol('ref')]: '#/components/schemas/Bar',
    // ...Inlined schema props
  }
}
```

3. Inlined and dereferenced schemas get traversed and all schemas marked with `Symbol('ref')` prop get replaced with a **string placeholder** holding the original `$ref` value. Note that string placeholders can be safely stringified.

```ts
{
  bar: '_OTJS-START_#/components/schemas/Bar_OTJS-END_';
}
```

Note: alias definitions (eg. `Foo: "#components/schemas/Bar"`) will result in a plain **string placeholder**.

```ts
'_OTJS-START_#/components/schemas/Bar_OTJS-END_';
```

4. Inlined and dereferenced schemas get stringified and parsed to retrieve **string placeholders** and the contained original `$ref` value

5. For each **string placeholder** found, an import statement to the relevant `$ref` schema is prepended and the placeholder replaced with the imported schema name.

```ts
import Bar from '../foo/Bar';

export default {
  bar: Bar;
} as const
```

This process could be definitely shorter if `@apidevtools/json-schema-ref-parser`'s `dereference` method allowed to access the parent object holding the `$ref` value to be replaced. In that case step 2 could be skipped and the ref object could be immediately replaced with the relevant **string placeholder**.

## `refHandling`: keep

`keep` option was implemented as last, and it currently follows the same flow as the `import` except for point 5, where schemas with **string placeholders** are replaced with the original `$ref` object `{$ref: "#/foo/bar" }`.

It's quite counterintuitive since refs gets dereferenced to be later re-referenced. The reason is that the dereferencing process is mis-used here as a way to detect `$ref`s all around the schemas and generate the relevant meta data for schema generation.

In a future refactoring we might consider skipping dereferencing for this `refHandling` option.

## OpenAPI $ref vs JSON schema $id

- [OpenAPI `$ref`s documentation](https://swagger.io/docs/specification/using-ref/)
- [JSON schema `$ref`s documentation](https://json-schema.org/understanding-json-schema/structuring.html#ref)
- [JSON schema Compound Schema Document `$id` documentation](https://json-schema.org/understanding-json-schema/structuring.html#bundling)

Each generated JSON schema is shipped with an inferred JSON schema Compound Schema Document `$id`.

We are currently assuming that a OpenAPI `$ref` like `#/components/schemas/MySchema` should be translated into the following JSON schema `$ref`/`$id`: `/components/schemas/MySchema`.

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
