---
'openapi-ts-json-schema': major
---

The `moduleSystem` option has been removed in favour of the new `importExtension: 'js' | 'ts' | 'none'` option.

**BREAKING CHANGE** — `moduleSystem` is no longer accepted. Migrate as follows:

| Before                | After                     |
| --------------------- | ------------------------- |
| `moduleSystem: 'esm'` | `importExtension: 'js'`   |
| `moduleSystem: 'cjs'` | `importExtension: 'none'` |


**Choosing the right value:**

| `importExtension`  | `tsconfig.json` `moduleResolution`     |
| ------------------ | -------------------------------------- |
| `'js'` _(default)_ | `node16`, `nodenext`                   |
| `'none'`           | `bundler`, legacy `node`               |
| `'ts'`             | Bun, Deno, native TypeScript runtimes  |
