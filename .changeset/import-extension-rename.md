---
'openapi-ts-json-schema': major
---

Replace `moduleSystem` option with `importExtension`

The `moduleSystem: 'esm' | 'cjs'` option has been replaced by `importExtension: 'js' | 'ts' | 'none'`, which directly describes what is emitted rather than mapping a module system concept onto an unrelated axis.

**Migration:**

| Before | After |
|---|---|
| `moduleSystem: 'esm'` | `importExtension: 'js'` |
| `moduleSystem: 'cjs'` | `importExtension: 'none'` |

**New `'ts'` value** — appends `.ts` to import specifiers, for runtimes that consume TypeScript natively (Bun, Deno).

**Choosing the right value:**

| `importExtension` | `tsconfig.json` `moduleResolution` |
|---|---|
| `'js'` _(default)_ | `node16`, `nodenext` |
| `'none'` | `bundler`, legacy `node` |
| `'ts'` | Bun, Deno, native TypeScript runtimes |
