---
'openapi-ts-json-schema': patch
---

Fix plugin system options mutation: `plugins` array is now shallow-copied when building internal options, preventing `onInit` hooks from mutating the caller's original array.
