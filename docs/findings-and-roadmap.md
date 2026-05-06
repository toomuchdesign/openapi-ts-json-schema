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

- [x] **Replace the string-placeholder system with a proper AST walk** — The current approach stringifies the schema, injects regex-delimited markers (`_OTJS-START_<id>_OTJS-END_`), does text surgery, then re-parses. This is fragile: any schema value that naturally contains the marker string will corrupt output silently. Redesign `makeTsJsonSchema` to walk the schema tree and emit TypeScript source code structurally, instead of operating on stringified JSON. **(Addressed in v3)**

- [x] **Fix the brute-force OpenAPI → JSON Schema conversion** — `convertOpenApiDocumentDefinitionsToJsonSchema.ts` recursively visits every node in the entire document with `mapObject({ deep: true })`. The code itself has a comment acknowledging this is wrong. OpenAPI defines specific fields that are schema objects; only those should be converted. Implement targeted conversion that follows the OpenAPI spec's definition of which fields are schema objects. Additionally, for OpenAPI v3.1.0 (which is already valid JSON Schema), skip conversion entirely — the version detection and conditional logic is missing.

- [x] **Harden the `namify` dependency** — Import names for generated schemas are derived via the `namify` package, which has no type definitions (suppressed with `@ts-expect-error`). There are no tests for edge cases: numeric-only names (`123`), hyphenated names (`my-schema`), or JavaScript reserved words (`class`, `return`, `type`). Add explicit tests for these cases and handle numeric-leading names with a `_` prefix fallback. Note: replacing `namify` with an alternative (e.g. `to-valid-identifier`) would change generated identifier names (`mySchema` → `my$j$schema`) and is therefore a **breaking change — target v3**.

---

## Section 3 — High: developer experience

- [x] **Improve error messages throughout** — Current errors include bare strings like "No matching schema found" and "Unsupported id value" with no context (which schema? what value was received?). Every thrown error should include: the offending schema id or path, the received value where applicable, and a hint toward the fix. Create a small set of custom error classes (e.g. `SchemaNotFoundError`, `InvalidIdError`) to make errors catchable programmatically.

- [ ] **Add input validation for `targets`** — The `targets.collections` and `targets.single` arrays are not validated. Invalid dot-notation paths (e.g. a typo) result in silent empty output rather than a useful error. Add a validation step that checks each target path exists in the bundled document and throws with a clear message if not.

- [x] **Propagate `deprecated: true` from OpenAPI to generated code** — OpenAPI allows marking schemas and properties as deprecated. Currently this information is silently dropped. At minimum, emit a JSDoc `@deprecated` comment on deprecated schemas and properties so IDEs can surface it to users.

- [ ] **Emit JSDoc comments from OpenAPI `description` fields** — The generated code is completely uncommented. OpenAPI `description` fields on schemas and properties contain human-readable documentation. Emit them as JSDoc `/** ... */` comments above the relevant exported constants and property keys. Make this opt-in with a `jsDocComments: boolean` option (default `true`).

---

## Section 4 — Medium: design and maintainability

- [x] **Extract magic strings and symbols to a constants file** — The placeholder markers (`_OTJS-START_`, `_OTJS-END_`), the Symbol key (`'SCHEMA_ID_SYMBOL'`), the comment-json sentinel (`'before'`), and hardcoded paths like `/components/schemas/` are scattered across multiple files. Centralise them in a `src/constants.ts` file to make the system's moving parts discoverable and prevent typo-driven bugs.

- [ ] **Unify the `id` / `$id` / `uniqueName` fields in `SchemaMetaData`** — These three fields are all derived from the same internal path but have inconsistent values in some edge cases (circular refs, alias definitions). Document the exact contract for each field (what it contains, when it differs from the others), or consolidate if the distinction isn't meaningful for consumers.

- [x] **Add structured error handling for plugin failures** — There is no documented or implemented behaviour for when a plugin throws. Does the entire generation fail? Does it continue with remaining plugins? Define the policy (fail-fast is reasonable), wrap plugin invocations in a try/catch that re-throws with the plugin name in the error message, and document this in `docs/plugins.md`.

- [x] **Remove `moduleSystem` difference from import path logic** — `makeRelativeImportPath` adds a `.js` extension for ESM but not for CJS. The reason for this asymmetry is not documented and is surprising (CJS modules also use `.js`). Investigate if this is actually correct, document why in the code if it is, or fix the inconsistency. **(Addressed in v2 as a non-breaking change: a new `importExtension: 'js' | 'ts' | 'none'` option was added that directly describes what is emitted at the import-specifier tail. The legacy `moduleSystem` option is mapped to the new option for backwards compatibility — `'esm' → 'js'`, `'cjs' → 'none'` — and will be removed in v3. Adopting this as additive rather than a replacement avoided forcing existing v2 consumers to migrate, and unlocked the new `'ts'` value for native TypeScript runtimes like Bun/Deno that the boolean ESM/CJS axis could not express.)**

---

## Section 5 — Medium: test quality

- [x] **Add explicit tests for alias schema edge cases** — `Foo: "#/components/schemas/Bar"` (a schema that is purely a reference) is acknowledged as a rough edge but has no dedicated test. Add tests for: alias with `refHandling: 'import'`, alias with `refHandling: 'inline'`, alias with `refHandling: 'keep'`, and chained aliases.

- [x] **Add tests for `namify` edge cases** — Numeric schema names, hyphenated names, names that are JavaScript reserved words, and names that collide after normalisation. These are currently untested and could produce invalid TypeScript.

- [x] **Add performance baseline test** — A heavy integration test using the real GitHub REST API spec (~7.5 MB, 1000+ schemas) lives in `test/gitHubApi.test.ts`. Skipped by default in `npm test`; run via `npm run test:heavy`.

---

## Section 6 — Documentation

- [x] **Rewrite the README "Why?" section to not assume knowledge of `json-schema-to-ts`** — The library's value is invisible to anyone who doesn't already know `json-schema-to-ts`. Lead with the problem in concrete terms: "You have an OpenAPI spec. You want TypeScript types AND a Fastify/Ajv validator. Without this library, you maintain both by hand and they drift." Then show how this library solves it. Introduce `json-schema-to-ts` as a tool, not a prerequisite.

- [x] **Add a concrete `idMapper` example** — The current description ("Useful for enforcing naming conventions") is too vague to be actionable. Add an example that shows the input id, the transformation, and why you'd want it (e.g. stripping the `/components/schemas/` prefix from `$id` values, or mapping to a flat namespace).

- [x] **Document plugin lifecycle order and error behaviour** — `docs/plugins.md` shows how to write a plugin but does not state the hook execution order (`onInit` → `onBeforeGeneration` → `onBeforeSaveFile`), what the consequences of returning early or throwing are, or how ordering between multiple plugins is determined. Add a "Lifecycle" subsection to `docs/plugins.md`.

- [ ] **Add a `refHandling: 'keep'` example in `examples/`** — This mode exists but has no example showing when and why you'd use it. A natural use case is Fastify's `addSchema` / `getSchema` dynamic registry — show that.

- [ ] **Add a CJS example** — The only example in `examples/` is ESM + Fastify. Add a minimal CJS example showing the dynamic `import()` pattern and the `moduleSystem: 'cjs'` option with different generated output.

- [x] **Document OpenAPI v3.1.0 handling** — Developer notes contain the observation that v3.1.0 schemas are already valid JSON Schema and shouldn't need conversion, but the code still converts them. Document the current state clearly: either explain why conversion still happens (maybe the library `@openapi-contrib/openapi-schema-to-json-schema` needs updating), or add version detection and skip conversion for v3.1.0.

- [x] **Add a comparison table vs. `openapi-typescript`** — The most common alternative people find is `openapi-typescript`. A concise table showing the difference (runtime validation support, `as const` output, `json-schema-to-ts` compatibility, etc.) would help users who land on this repo understand whether it's what they need without requiring them to read both READMEs.

---

## Section 7 — Ecosystem and adoption

- [ ] **Add an `expressIntegrationPlugin`** — Fastify is a natural fit, but many users are on Express. A dedicated plugin (similar to `fastifyIntegrationPlugin`) that wires the generated schemas into Express middleware (e.g. via `ajv` directly) would expand the library's addressable audience. Zod integration is out of scope — `json-schema-to-zod` already covers that use case.

- [ ] **Consider a CLI entrypoint** — Currently the library is API-only. A `npx openapi-ts-json-schema --input ./openapi.yaml --targets components.schemas` CLI would lower the barrier to initial evaluation and fit into scripts/CI more naturally than a Node.js generation script.

---

## Section 8 — Low priority / polish

- [x] **Evaluate replacing `comment-json` with a lighter alternative** — `comment-json` is used to preserve inline comments during stringification of the `keep` ref strategy. Verify this is still necessary with the current implementation; if the placeholder/stringify pipeline is replaced (see Section 2), this dependency may become unnecessary.
