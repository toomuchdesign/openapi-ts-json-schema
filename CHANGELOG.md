# openapi-ts-json-schema

## 1.0.0

### Major Changes

- [#448](https://github.com/toomuchdesign/openapi-ts-json-schema/pull/448) [`98ee5fb`](https://github.com/toomuchdesign/openapi-ts-json-schema/commit/98ee5fb6ae18adc1a21bd90d09647b8d41d0dce3) Thanks [@toomuchdesign](https://github.com/toomuchdesign)! - Release stable version

- [#446](https://github.com/toomuchdesign/openapi-ts-json-schema/pull/446) [`e608aa5`](https://github.com/toomuchdesign/openapi-ts-json-schema/commit/e608aa5271317b0d2d0db3d2a20e4d16b8a3638b) Thanks [@toomuchdesign](https://github.com/toomuchdesign)! - Restrict Node support to v20+

## 0.14.0

### Minor Changes

- [#438](https://github.com/toomuchdesign/openapi-ts-json-schema/pull/438) [`b97dcae`](https://github.com/toomuchdesign/openapi-ts-json-schema/commit/b97dcae8f60db18db33dac1f59a2eec51e096846) Thanks [@toomuchdesign](https://github.com/toomuchdesign)! - Add support for plugins `onBeforeSaveFile` hook

- [#438](https://github.com/toomuchdesign/openapi-ts-json-schema/pull/438) [`b97dcae`](https://github.com/toomuchdesign/openapi-ts-json-schema/commit/b97dcae8f60db18db33dac1f59a2eec51e096846) Thanks [@toomuchdesign](https://github.com/toomuchdesign)! - Drop `with$id` schema generaion

- [#438](https://github.com/toomuchdesign/openapi-ts-json-schema/pull/438) [`b97dcae`](https://github.com/toomuchdesign/openapi-ts-json-schema/commit/b97dcae8f60db18db33dac1f59a2eec51e096846) Thanks [@toomuchdesign](https://github.com/toomuchdesign)! - Rename `$idMapper` option as `idMapper`

- [#444](https://github.com/toomuchdesign/openapi-ts-json-schema/pull/444) [`47eb157`](https://github.com/toomuchdesign/openapi-ts-json-schema/commit/47eb157ad7f00cfc26fe68e47657dd7b8b681353) Thanks [@toomuchdesign](https://github.com/toomuchdesign)! - Rename `openApiSchema` option as `openApiDocument`

- [#438](https://github.com/toomuchdesign/openapi-ts-json-schema/pull/438) [`b97dcae`](https://github.com/toomuchdesign/openapi-ts-json-schema/commit/b97dcae8f60db18db33dac1f59a2eec51e096846) Thanks [@toomuchdesign](https://github.com/toomuchdesign)! - Add `generateSchemaWith$idPlugin` plugin

## 0.13.0

### Minor Changes

- [#257](https://github.com/toomuchdesign/openapi-ts-json-schema/pull/257) [`fe4f838`](https://github.com/toomuchdesign/openapi-ts-json-schema/commit/fe4f8383a2aa2d7bbc86d1d31ff72ab3457c1adb) Thanks [@toomuchdesign](https://github.com/toomuchdesign)! - Add `openApiDefinition` prop to generated metaData

- [#262](https://github.com/toomuchdesign/openapi-ts-json-schema/pull/262) [`e63f47e`](https://github.com/toomuchdesign/openapi-ts-json-schema/commit/e63f47e100687898e30a9ca474f07816d23df5e7) Thanks [@toomuchdesign](https://github.com/toomuchdesign)! - `shouldBeGenerated` prop added to `metaData`

- [#262](https://github.com/toomuchdesign/openapi-ts-json-schema/pull/262) [`e63f47e`](https://github.com/toomuchdesign/openapi-ts-json-schema/commit/e63f47e100687898e30a9ca474f07816d23df5e7) Thanks [@toomuchdesign](https://github.com/toomuchdesign)! - Recursion comments removed

## 0.12.2

### Patch Changes

- 8ef8912: Export `with$id` schema with `as const` notation

## 0.12.1

### Patch Changes

- 6d55193: Fix generated `$ref` schemas when `$ref`ed with different descriptions

## 0.12.0

### Minor Changes

- 3a77c85: Leading `/` in schema filenames not removed anymore. Path schemas filanames handled as: `/my/path` --> `\_my_path`.
- ea41ce5: Expose schemas without `$id` as default and schemas with `$id` as `with$id` (sorry for this change of mind!)

### Patch Changes

- 3a77c85: Fix `/` api paths being stored out of paths folder

## 0.11.0

### Minor Changes

- 0c68392: Convert components.parameters definitions to JSON schema
- b556e65: Return human friendly error on convertToJsonSchema failure

### Patch Changes

- ae58641: Skip "type" prop valdation on OpenAPI --> JSON schema conversion

## 0.10.0

### Minor Changes

- 4e9df30: Fastify plugin: `sharedSchemasFilter` option renamed as `schemaFilter`
- bfc0f73: Plugins api changed from a single callback function to 2 optional `onInit` and `onBeforeGeneration` methods
- 89fcf87: `metaData.schemas` entry registered by internal id (`components/schemas/Foo`) instead of `$ref`
- 395a61e: Provide plugins access to options object
- 4e9df30: Add `$idMapper` option

### Patch Changes

- 4e9df30: Fastify plugin: generate $ref values that Fastify's `addSchema` can resolve

## 0.9.2

### Patch Changes

- c2716a5: Fix JSON Schema conversions on objects with `type` prop

## 0.9.1

### Patch Changes

- b88000d: Skip converting OpenApi definitions not transformable into JSON schemas
- b88000d: Convert definitions expressed as array of schemas

## 0.9.0

### Minor Changes

- 06b8d4f: Use `_` as path separator to support Windows OS
- a8b4e24: Metadata props renamed (see documentation)
- a418ecb: `PluginInput['makeRelativePath']` type renamed to `PluginInput['makeRelativeModulePath']`
- a418ecb: Support Windows OS
- 8ce3621: Merge operation and path level path parameters
- a418ecb: `schemaFileName` metadata prop removed

### Patch Changes

- 7461657: Convert inlined definitions in other places then components prop

## 0.8.0

### Minor Changes

- a134798: Returned `metaData.schema` property replaced by `metaData.originalSchema` holding the original dereferenced JSON schema

### Patch Changes

- fcd7b9d: Append `type: "object"` prop to generated parameter schemas

## 0.7.0

### Minor Changes

- 1f01e99: Resolve circular $refs with "inline" refHandling option

### Patch Changes

- 4206868: Cleanup dependencies

## 0.6.0

### Minor Changes

- 1f3294a: default `refHandling` option switched from "inline" to "import"
- 1b6a53d: Throw descriptive error with circular schemas and "inline" `refHandling` option

## 0.5.0

### Minor Changes

- 05c3865: Partially support external ref deduplication when refHandling === "import"

### Patch Changes

- ebcfd27: Don't duplicate alias definitions but re-export original schema

## 0.4.0

### Minor Changes

- 905ef5a: Remove `experimentalImportRefs` option in favour of `refHandling`
- b5688ad: Expose `metaData` return property holding generated schemas meta data
- 79feb32: Introduce `plugins` option
- 85ca0e8: Add "keep" `refHandling` option, to preserve $ref objects
- 62ded69: Add `fastifyIntegrationPlugin` plugin

### Patch Changes

- 9e0a222: Fix `isRef` meta data prop for inline `refHandling` option
- 27404ae: Fix external local `$ref`s resolution

## 0.3.0

### Minor Changes

- 409c154: Handle circular `$ref` values.
- 8513db4: Add `experimentalImportRefs` option to generate and import `$ref` schema files istead of inlining.
- 7c61c0f: Generate nested folders instead of dotted path folders

## 0.2.0

### Minor Changes

- 56cf900: OpenAPI parameters get converted only when found in the places dictated by the specs (`paths[path].parameters` and `paths[path][operation].parameters`)
- 1543d34: Preserve commented `$ref` property in deferenced schemas
- d4395ea: Resolve external and public remote $refs

### Patch Changes

- d3d5fa5: Convert deeply nested OpenAPI definitions

## 0.1.0

### Minor Changes

- f8961ad: Make `definitionPathsToGenerateFrom` option required
- 9d443b9: Rename returned `outputFolder` -> `outputPath`
- f8961ad: Prefix error messages with `[openapi-ts-json-schema]`
- 9d443b9: Add support for `outputPath` option
- 8c388c8: Convert OpenAPI parameters array to JSON schema

### Patch Changes

- 9030beb: Fix `schemaPatcher` to patch deeply nested props

## 0.0.1

### Patch Changes

- 6454f47: Initial release
