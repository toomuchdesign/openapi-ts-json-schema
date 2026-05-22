# Findings & Roadmap

> Code review and strategic analysis of `openapi-ts-json-schema`.

---

## Section 1 — Critical: blocking real-world adoption

- [ ] **Fix external `$ref` deduplication** — When multiple OpenAPI files share components via external `$ref`s, those components are bundled and duplicated in every output file, defeating the purpose of shared schemas. This is the single biggest blocker for monorepo users. Investigate replacing the current `@apidevtools/json-schema-ref-parser` `bundle` call with an OpenAPI-aware merger (the developer notes already list 7 candidates: `openapi-merger`, `openapi-merge`, `@stoplight/json-ref-resolver`, etc.). Decide on the right approach and implement it.

- [ ] **Support merging multiple OpenAPI definition files** — Related to the above: there is no supported way to generate schemas from multiple OpenAPI specs into a single coherent output. This is a prerequisite for any multi-service or monorepo setup. Define the API for this (e.g. `openApiDocuments: string[]`) and implement it.

---

## Section 3 — Ecosystem and adoption

- [ ] **Add an `expressIntegrationPlugin`** — Fastify is a natural fit, but many users are on Express. A dedicated plugin (similar to `fastifyIntegrationPlugin`) that wires the generated schemas into Express middleware (e.g. via `ajv` directly) would expand the library's addressable audience. Zod integration is out of scope — `json-schema-to-zod` already covers that use case.
