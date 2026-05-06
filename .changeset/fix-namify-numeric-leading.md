---
'openapi-ts-json-schema': patch
---

Prefix `uniqueName` with `_` when `namify` produces a digit-leading identifier, ensuring generated import names are always valid JavaScript identifiers.
