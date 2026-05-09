---
'openapi-ts-json-schema': minor
---

Add `importExtension` option, deprecate `moduleSystem`

The new `importExtension: 'js' | 'ts' | 'none'` option directly describes what is emitted at the end of relative import specifiers, rather than mapping a module system concept onto an unrelated axis. The legacy `moduleSystem: 'esm' | 'cjs'` option is now deprecated but **still supported** — when only `moduleSystem` is set, it is mapped to the equivalent `importExtension`. When both are set, `importExtension` wins and `moduleSystem` is ignored.

This is intentionally a **non-breaking** change so the fix can land in v2 without forcing existing consumers to migrate. `moduleSystem` will be removed in a future major release.

**Migration (recommended):**

| Before                | After                     |
| --------------------- | ------------------------- |
| `moduleSystem: 'esm'` | `importExtension: 'js'`   |
| `moduleSystem: 'cjs'` | `importExtension: 'none'` |

**New `'ts'` value** — appends `.ts` to import specifiers, for runtimes that consume TypeScript natively (Bun, Deno). Not expressible with the old `moduleSystem` option.

**Choosing the right value:**

| `importExtension`  | `tsconfig.json` `moduleResolution`     |
| ------------------ | -------------------------------------- |
| `'js'` _(default)_ | `node16`, `nodenext`                   |
| `'none'`           | `bundler`, legacy `node`               |
| `'ts'`             | Bun, Deno, native TypeScript runtimes  |
