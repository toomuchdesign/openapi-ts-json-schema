---
'openapi-ts-json-schema': major
---

Validate the shape of `targets.single` and `targets.collections` entries

Each target path is now checked against the bundled OpenAPI document and rejected with a clear error when the resolved value cannot be processed. This catches typos and misuse that previously produced nonsensical output files.

**BREAKING CHANGE** — invocations that previously emitted incorrect files now throw. The new validations are:

- A `single` or `collections` target that resolves to a primitive or array throws `"targets.<kind>" target "<path>" must resolve to an object, got <type>`.
- A `collections` target whose direct children are not all objects (e.g. a leaf schema like `components.schemas.User` passed as a collection) throws `"targets.collections" target "<path>" must be a record of definition objects, but child "<key>" is <type>. Did you mean to use "targets.single"?`.

The pre-existing `target not found in OAS definition` error is unchanged.
