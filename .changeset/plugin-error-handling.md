---
'openapi-ts-json-schema': minor
---

Plugin hook invocations are now wrapped in try/catch; errors re-thrown with the plugin name (or index) and hook name for easier debugging. Add optional `name` property to the `Plugin` return type.
