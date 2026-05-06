# Findings & Roadmap

> Code review and strategic analysis of `openapi-ts-json-schema`.
> Items are sorted by priority within each section. Check off items as they are completed.

---

## Executive Summary

`openapi-ts-json-schema` solves a real and underserved problem: keeping an OpenAPI spec, a runtime validator (Ajv/Fastify), and TypeScript types in sync from a single source of truth. The core pipeline works and is well-tested. The main barriers to wider adoption are:

1. **One known structural bug** (external `$ref` deduplication) that breaks monorepo setups
2. **A fragile internal implementation** (string placeholders, brute-force schema conversion) that creates maintenance debt
3. **Positioning and documentation** that require prior knowledge of `json-schema-to-ts` to understand the value
4. **Missing DX features** (watch mode, useful error messages, barrel exports) that make day-to-day use harder
5. **Limited ecosystem** (only 2 plugins, no community examples) that makes the library feel incomplete

---

## Section 1 — Critical: blocking real-world adoption

- [ ] **Fix external `$ref` deduplication** — When multiple OpenAPI files share components via external `$ref`s, those components are bundled and duplicated in every output file, defeating the purpose of shared schemas. This is the single biggest blocker for monorepo users. Investigate replacing the current `@apidevtools/json-schema-ref-parser` `bundle` call with an OpenAPI-aware merger (the developer notes already list 7 candidates: `openapi-merger`, `openapi-merge`, `@stoplight/json-ref-resolver`, etc.). Decide on the right approach and implement it.

- [ ] **Support merging multiple OpenAPI definition files** — Related to the above: there is no supported way to generate schemas from multiple OpenAPI specs into a single coherent output. This is a prerequisite for any multi-service or monorepo setup. Define the API for this (e.g. `openApiDocuments: string[]`) and implement it.

---

## Section 2 — High: architecture and correctness

- [ ] **Replace the string-placeholder system with a proper AST walk** — The current approach stringifies the schema, injects regex-delimited markers (`_OTJS-START_<id>_OTJS-END_`), does text surgery, then re-parses. This is fragile: any schema value that naturally contains the marker string will corrupt output silently. Redesign `makeTsJsonSchema` to walk the schema tree and emit TypeScript source code structurally, instead of operating on stringified JSON.

- [ ] **Fix the brute-force OpenAPI → JSON Schema conversion** — `convertOpenApiDocumentDefinitionsToJsonSchema.ts` recursively visits every node in the entire document with `mapObject({ deep: true })`. The code itself has a comment acknowledging this is wrong. OpenAPI defines specific fields that are schema objects; only those should be converted. Implement targeted conversion that follows the OpenAPI spec's definition of which fields are schema objects. Additionally, for OpenAPI v3.1.0 (which is already valid JSON Schema), skip conversion entirely — the version detection and conditional logic is missing.

- [x] **Fix options mutation in plugin system** — `fastifyIntegrationPlugin.onInit` mutates the user-supplied `options` object in place (`options.refHandling = 'keep'`, `options.plugins.push(...)`). This creates hidden side effects and makes plugin ordering a source of bugs. Make a defensive copy of options at the start of `openapiToTsJsonSchema`, and document that plugins receive a snapshot, not a reference.

- [ ] **Harden the `namify` dependency** — Import names for generated schemas are derived via the `namify` package, which has no type definitions (suppressed with `@ts-expect-error`). There are no tests for edge cases: numeric-only names (`123`), hyphenated names (`my-schema`), or JavaScript reserved words (`class`, `return`, `type`). Add explicit tests for these cases and handle numeric-leading names with a `_` prefix fallback. Note: replacing `namify` with an alternative (e.g. `to-valid-identifier`) would change generated identifier names (`mySchema` → `my$j$schema`) and is therefore a **breaking change — target v3**.

- [ ] **Remove `@ts-expect-error` suppressions from core logic** — There are 4 `@ts-expect-error` comments in `openapiToTsJsonSchema.ts` and `convertOpenApiPathsParameters/`. These suppress real type mismatches (e.g. passing an OpenAPI document to an API typed for JSON Schema). Replace them with proper type casts or type guards with runtime validation at the relevant boundaries.

- [ ] **Fix alias schema handling** — When a schema is just a reference to another (`Foo: "#/components/schemas/Bar"`), it results in a plain string placeholder rather than a proper schema object, and the generated file loses its `as const` assertion. Developer notes acknowledge this as "a bit rough". Implement a proper alias path that generates a consistent, typed output.

---

## Section 3 — High: developer experience

- [x] **Improve error messages throughout** — Current errors include bare strings like "No matching schema found" and "Unsupported id value" with no context (which schema? what value was received?). Every thrown error should include: the offending schema id or path, the received value where applicable, and a hint toward the fix. Create a small set of custom error classes (e.g. `SchemaNotFoundError`, `InvalidIdError`) to make errors catchable programmatically.

- [ ] **Add input validation for `targets`** — The `targets.collections` and `targets.single` arrays are not validated. Invalid dot-notation paths (e.g. a typo) result in silent empty output rather than a useful error. Add a validation step that checks each target path exists in the bundled document and throws with a clear message if not.

- [ ] **Make Prettier configurable and optional** — Prettier is called per-file with hardcoded `{ parser: 'typescript' }` and no way for users to pass their own Prettier config (indent, semicolons, print width, etc.). At a minimum, read the project's existing `.prettierrc` if present. Ideally, accept a `prettier` option in the main options object, and add a `formatting: false` escape hatch to skip formatting entirely for users who have their own post-processing step.

- [ ] **Add a `--watch` / incremental mode** — Full regeneration on every run is fine for small specs but becomes slow with 100+ schemas. Implement a watch mode that monitors the input OpenAPI file and regenerates only when it changes. A simpler first step: add a `force: boolean` option that skips generation if the output already exists and the input hasn't changed (based on mtime or hash).

- [ ] **Generate barrel files (`index.ts`)** — Large specs produce hundreds of individual `.ts` files. Without a barrel, users must know the exact generated path for every import. Emit an `index.ts` in each generated directory re-exporting all schemas in it. Make this opt-in with an `exportBarrelFiles: boolean` option.

- [ ] **Propagate `deprecated: true` from OpenAPI to generated code** — OpenAPI allows marking schemas and properties as deprecated. Currently this information is silently dropped. At minimum, emit a JSDoc `@deprecated` comment on deprecated schemas and properties so IDEs can surface it to users.

- [ ] **Emit JSDoc comments from OpenAPI `description` fields** — The generated code is completely uncommented. OpenAPI `description` fields on schemas and properties contain human-readable documentation. Emit them as JSDoc `/** ... */` comments above the relevant exported constants and property keys. Make this opt-in with a `jsDocComments: boolean` option (default `true`).

---

## Section 4 — Medium: design and maintainability

- [x] **Extract magic strings and symbols to a constants file** — The placeholder markers (`_OTJS-START_`, `_OTJS-END_`), the Symbol key (`'SCHEMA_ID_SYMBOL'`), the comment-json sentinel (`'before'`), and hardcoded paths like `/components/schemas/` are scattered across multiple files. Centralise them in a `src/constants.ts` file to make the system's moving parts discoverable and prevent typo-driven bugs.

- [ ] **Make `clearFolder` safe** — The output directory is deleted before each generation run with no opt-out. Users who place non-generated files in the output directory (e.g. a hand-written adapter, a custom index) will lose them silently. Add a `clearOutputDir: boolean` option (default `true`) and document the destructive behaviour explicitly.

- [ ] **Make `Symbol`-based ref tracking debuggable** — `Symbol.for('SCHEMA_ID_SYMBOL')` is used to mark inlined schemas before placeholder replacement. Symbol properties are invisible to `JSON.stringify` and debuggers. Consider replacing the symbol annotation with a wrapper object `{ __otjsId: string, schema: SchemaObject }` that is serialisable and inspectable, making intermediate states easier to debug.

- [ ] **Unify the `id` / `$id` / `uniqueName` fields in `SchemaMetaData`** — These three fields are all derived from the same internal path but have inconsistent values in some edge cases (circular refs, alias definitions). Document the exact contract for each field (what it contains, when it differs from the others), or consolidate if the distinction isn't meaningful for consumers.

- [x] **Add structured error handling for plugin failures** — There is no documented or implemented behaviour for when a plugin throws. Does the entire generation fail? Does it continue with remaining plugins? Define the policy (fail-fast is reasonable), wrap plugin invocations in a try/catch that re-throws with the plugin name in the error message, and document this in `docs/plugins.md`.

- [ ] **Remove `moduleSystem` difference from import path logic** — `makeRelativeImportPath` adds a `.js` extension for ESM but not for CJS. The reason for this asymmetry is not documented and is surprising (CJS modules also use `.js`). Investigate if this is actually correct, document why in the code if it is, or fix the inconsistency.

- [ ] **Improve `refHandling: 'keep'` implementation** — Currently `keep` follows the full `import` flow (dereference, mark, placeholder) and only diverges at the last step. This means it still pays the cost of the import pipeline for something it doesn't use. Implement a dedicated, simpler code path for `keep` that skips the placeholder machinery entirely.

---

## Section 5 — Medium: test quality

- [ ] **Add explicit tests for alias schema edge cases** — `Foo: "#/components/schemas/Bar"` (a schema that is purely a reference) is acknowledged as a rough edge but has no dedicated test. Add tests for: alias with `refHandling: 'import'`, alias with `refHandling: 'inline'`, alias with `refHandling: 'keep'`, and chained aliases.

- [ ] **Add tests for `namify` edge cases** — Numeric schema names, hyphenated names, names that are JavaScript reserved words, and names that collide after normalisation. These are currently untested and could produce invalid TypeScript.

- [ ] **Add a test for the Prettier config passthrough** (once implemented) — Verify that user-supplied Prettier options are respected in generated output.

- [ ] **Reduce fixture verbosity** — Some test YAML fixtures run to hundreds of lines, making it hard to understand what a specific test is exercising. Where possible, trim fixtures to the minimal spec required to reproduce the scenario being tested.

- [ ] **Add performance baseline test** — Generate schemas from a realistically large OpenAPI spec (e.g. the Petstore extended or a public API spec with 50+ schemas) and assert that generation completes within a reasonable time budget. This will catch regressions from future Prettier or pipeline changes.

---

## Section 6 — Documentation

- [ ] **Rewrite the README "Why?" section to not assume knowledge of `json-schema-to-ts`** — The library's value is invisible to anyone who doesn't already know `json-schema-to-ts`. Lead with the problem in concrete terms: "You have an OpenAPI spec. You want TypeScript types AND a Fastify/Ajv validator. Without this library, you maintain both by hand and they drift." Then show how this library solves it. Introduce `json-schema-to-ts` as a tool, not a prerequisite.

- [ ] **Add a "Known Limitations" section to README** — The external `$ref` duplication bug, the missing discriminator support, and the alias edge cases are currently buried in developer notes or absent entirely. Surface them clearly upfront so users don't invest days before hitting a wall.

- [ ] **Add a concrete `idMapper` example** — The current description ("Useful for enforcing naming conventions") is too vague to be actionable. Add an example that shows the input id, the transformation, and why you'd want it (e.g. stripping the `/components/schemas/` prefix from `$id` values, or mapping to a flat namespace).

- [ ] **Document plugin lifecycle order and error behaviour** — `docs/plugins.md` shows how to write a plugin but does not state the hook execution order (`onInit` → `onBeforeGeneration` → `onBeforeSaveFile`), what the consequences of returning early or throwing are, or how ordering between multiple plugins is determined. Add a "Lifecycle" subsection to `docs/plugins.md`.

- [ ] **Add a `refHandling: 'keep'` example in `examples/`** — This mode exists but has no example showing when and why you'd use it. A natural use case is Fastify's `addSchema` / `getSchema` dynamic registry — show that.

- [ ] **Add a CJS example** — The only example in `examples/` is ESM + Fastify. Add a minimal CJS example showing the dynamic `import()` pattern and the `moduleSystem: 'cjs'` option with different generated output.

- [ ] **Document OpenAPI v3.1.0 handling** — Developer notes contain the observation that v3.1.0 schemas are already valid JSON Schema and shouldn't need conversion, but the code still converts them. Document the current state clearly: either explain why conversion still happens (maybe the library `@openapi-contrib/openapi-schema-to-json-schema` needs updating), or add version detection and skip conversion for v3.1.0.

- [ ] **Add a comparison table vs. `openapi-typescript`** — The most common alternative people find is `openapi-typescript`. A concise table showing the difference (runtime validation support, `as const` output, `json-schema-to-ts` compatibility, etc.) would help users who land on this repo understand whether it's what they need without requiring them to read both READMEs.

- [ ] **Add a "Troubleshooting" section** — Common issues (generated output is empty, types are `never`, external refs are duplicated, plugin execution order issues) should have a short FAQ entry. This reduces support burden and improves discoverability via search.

---

## Section 7 — Ecosystem and adoption

- [ ] **Create a `show-and-tell` or `examples` GitHub Discussion category** — Give users a place to share how they're using the library. Community examples increase trust and discoverability, and help identify missing features organically.

- [ ] **Publish to more package registries / cross-post** — Write a dev.to or Medium post explaining the problem this solves with a working walkthrough. The library is essentially unfindable unless you already know the exact phrase "TypeScript JSON Schema from OpenAPI". A post that appears in search for "openapi typescript validation types sync" would drive meaningful traffic.

- [ ] **Add a `used by` showcase to README** — Even a small list of projects using the library builds credibility. Request early adopters to add themselves via a Discussion thread.

- [ ] **Add Express/Zod integration example or plugin** — Fastify is a natural fit, but many users are on Express. An `expressIntegrationPlugin` or a `zodIntegrationPlugin` that generates Zod schemas from the generated JSON Schemas would expand the library's addressable audience significantly.

- [ ] **Consider a CLI entrypoint** — Currently the library is API-only. A `npx openapi-ts-json-schema --input ./openapi.yaml --targets components.schemas` CLI would lower the barrier to initial evaluation and fit into scripts/CI more naturally than a Node.js generation script.

---

## Section 8 — Low priority / polish

- [ ] **Add `targets` validation for duplicates** — If the same path appears in both `targets.collections` and `targets.single`, behaviour is undefined. Detect and warn or error.

- [ ] **Consider supporting JSON Schema output in addition to TypeScript** — Some users may want to generate validated `.json` schema files rather than `.ts` modules (e.g. for use in non-TypeScript projects). A `outputFormat: 'ts' | 'json'` option would widen applicability.

- [ ] **Add schema-level deprecation filtering** — An option like `excludeDeprecated: true` that skips generating schemas marked `deprecated: true` in the OpenAPI spec. Useful for codebases actively removing deprecated paths.

- [ ] **Add glob/negative selection for `targets`** — Currently `targets` requires exact paths. Allow glob patterns (e.g. `components.schemas.*`) and negative selectors (e.g. `!components.schemas.Internal*`) so users can exclude internal or test schemas from generation.

- [ ] **Evaluate replacing `comment-json` with a lighter alternative** — `comment-json` is used to preserve inline comments during stringification of the `keep` ref strategy. Verify this is still necessary with the current implementation; if the placeholder/stringify pipeline is replaced (see Section 2), this dependency may become unnecessary.
