# openapi-ts-json-schema

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
