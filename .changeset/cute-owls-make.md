---
'openapi-ts-json-schema': major
---

Generated schemas now better reflect the source OpenAPI document.

**What**

- OpenAPI 3.1 documents are no longer transformed. Previously, 3.1 keywords like `nullable: true` were rewritten the OAS 3.0 way; now 3.1 schemas pass through unchanged (they are already valid JSON Schema).
- Only schemas in spec-defined locations are converted (`components.schemas`, `definitions`, and values under `schema` keys in paths/components). Schemas embedded in non-standard places (e.g. vendor extensions) are no longer rewritten.

**How to update**

- If your input is OAS 3.1, expect generated schemas to match the source exactly — author 3.1-style keywords (e.g. `type: ['string', 'null']`) rather than 3.0 ones.
- If you relied on schemas in non-standard locations being converted, move them under a standard `schema` key.
