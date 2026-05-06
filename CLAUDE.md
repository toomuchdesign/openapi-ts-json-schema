# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Build
npm run build

# Run all tests (builds Fastify example first, then runs Vitest)
npm test

# Run a single test file
npx vitest run test/index.test.ts

# Type checking
npm run type:check

# Format check / fix
npm run prettier:check
npm run source:fix
```

Tests run sequentially (`maxWorkers: 1`) because they write files to disk. The setup file (`vitest.setup.ts`) cleans up generated files after each run.

## Architecture

`openapi-ts-json-schema` converts OpenAPI 3.0/3.1 documents into TypeScript-first JSON Schema modules (`.ts` files with `as const`) that support both runtime validation (Ajv, Fastify) and static type inference (via `json-schema-to-ts`).

### Data Flow

```
OpenAPI document (JSON/YAML)
  → @apidevtools/json-schema-ref-parser  (bundle + dereference $refs)
  → @openapi-contrib/openapi-schema-to-json-schema  (OpenAPI → JSON Schema)
  → ref strategy (import / inline / keep)
  → TypeScript .ts files with `as const`
```

### Core Modules

- **`src/openapiToTsJsonSchema.ts`** — Main entry point; orchestrates plugin lifecycle, input validation, and the full conversion pipeline.
- **`src/types.ts`** — Authoritative type definitions: `Options`, `SchemaMetaData`, `Plugin` interface, `RefHandling` enum.
- **`src/utils/convertOpenApiDocumentDefinitionsToJsonSchema.ts`** — Transforms OpenAPI schema objects to JSON Schema.
- **`src/utils/makeTsJsonSchema/`** — Handles the three `refHandling` strategies (`import`, `inline`, `keep`) and emits TypeScript source. Key files: `replaceInlinedRefsWithStringPlaceholder.ts`, `replacePlaceholdersWithImportedSchemas.ts`, `replacePlaceholdersWithRefs.ts`, `stringify.ts` (uses `comment-json`).
- **`src/utils/makeSchemaFileContents.ts`** — Composes generated file contents per schema.
- **`src/utils/saveSchemaFiles.ts`** — Writes files to disk.
- **`src/plugins/`** — Plugin implementations (`fastifyIntegrationPlugin`, `generateSchemaWith$idPlugin`).

### Plugin System

Plugins receive `{ outputPath, metaData, options }` at two lifecycle hooks: `before` (pre-generation) and `after` (post-generation). See `docs/plugins.md` and `src/types.ts` for the `Plugin` interface.

### `$ref` Handling Strategies

Controlled by `options.refHandling`:
- **`import`** (default) — Each referenced schema becomes a separate `.ts` file; cross-file TypeScript `import` statements are emitted.
- **`inline`** — Referenced schemas are inlined at the usage site.
- **`keep`** — `$ref` strings are preserved as-is in the output.

Internal schema IDs use a path-based convention documented in `docs/developer-notes.md`.

## TypeScript Config Notes

- ESM-only package (`"type": "module"` in package.json), Node 20+.
- `verbatimModuleSyntax: true` — use explicit `import type` / `import` distinctions.
- `noUncheckedIndexedAccess: true` — array and record accesses may be `T | undefined`.
- Build target is `dist/` via `tsconfig.build.json` (entry: `src/index.ts` only).
