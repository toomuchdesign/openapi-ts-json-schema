# Developer's notes

## Remote $ref handling

Remote/external `$ref`s (`Pet.yaml`, `definitions.json#/Pet`) get always immediately dereferenced by fetching the specs and inlining the relevant schemas.

## $ref imports

`experimentalImportRefs` option introduces the ability to generate NOT inline `$ref` schemas, but to generate the relevant import statement and reference them as external schema file.

At the time of writing the implementation is build around `@apidevtools/json-schema-ref-parser`'s `dereference` method options and works as follows:

1. Schemas get deferenced with `@apidevtools/json-schema-ref-parser`'s `dereference` method which inlines relevant `$ref` schemas
2. Inlined schemas get marked with a symbol property holding the original `$ref` value (`#/foo/Bar`)

```ts
{
  bar: {
    [Symbol('ref')]: '#/foo/Bar',
    // ...Inlined schema props
  }
}
```

3. Inlined and dereferenced schemas get traversed and all schemas marked with `Symbol('ref')` prop get replaced with a **string placeholder** holding the original `$ref` value. Note that string placeholders can be safely stringified.

```ts
{
  bar: '_REF_MARKER_START_#/foo/Bar_REF_MARKER_END_';
}
```

4. Inlined and dereferenced schemas get stringified and parsed to retrieve **string placeholders** and the contained original `$ref` value

5. For each **string placeholder** found, an import statement to the relevant `$ref` schema is prepended and the placeholder replaced with the imported schema name.

```ts
import Bar from '../foo/Bar';

{
  bar: Bar;
}
```

This process could be definitely shorter if `@apidevtools/json-schema-ref-parser`'s `dereference` method allowed to access the parent object holding the `$ref` value to be replaced. In that case step 2 could be skipped and the ref object could be immediately replaced with the relevant **string placeholder**.

## Debugging tests

Comment [this line](https://github.com/toomuchdesign/openapi-ts-json-schema/blob/master/vitest.setup.mts#L17) out to disable schemas cleanup after tests and check the generated files.
