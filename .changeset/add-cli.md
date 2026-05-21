---
'openapi-ts-json-schema': minor
---

Add an `openapi-ts-json-schema` CLI, supporting two mutually exclusive modes:

- **Flags mode** for simple setups (e.g. `--input`, `--collections`, `--ref-handling`).
- **Config file mode** via `--config <file>`, where the file `export default`s an `Options` object — required when using `plugins`, `schemaPatcher`, or `idMapper`.
