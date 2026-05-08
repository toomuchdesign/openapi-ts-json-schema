import { COMMENT_JSON_BEFORE_SYMBOL } from '../../constants.js';
import type {
  IdMapper,
  ModuleSystem,
  RefHandling,
  SchemaMetaDataMap,
} from '../../types.js';
import { makeRelativeImportPath } from '../makeRelativeImportPath.js';
import { getId } from './getId.js';

type EmittedImport = {
  uniqueName: string;
  importPath: string;
};

type EmitContext = {
  refHandling: RefHandling;
  imports: Map<string, EmittedImport>;
  schemaMetaDataMap: SchemaMetaDataMap;
  absoluteDirName: string;
  moduleSystem: ModuleSystem;
  idMapper: IdMapper;
};

type CommentNode = { type?: unknown; value?: unknown };

/**
 * Translate a comment-json `before` marker on a node into JS comment text:
 * `LineComment` becomes a `//` line, `BlockComment` becomes a block comment.
 * Returns an empty string when no marker is present.
 */
function renderLeadingComment(node: object): string {
  const before = (node as Record<symbol, unknown>)[COMMENT_JSON_BEFORE_SYMBOL];
  if (!Array.isArray(before)) return '';

  let out = '';
  for (const entry of before as CommentNode[]) {
    if (!entry || typeof entry !== 'object') continue;
    if (entry.type === 'LineComment') {
      out += `//${typeof entry.value === 'string' ? entry.value : ''}\n`;
    } else if (entry.type === 'BlockComment') {
      out += `/*${typeof entry.value === 'string' ? entry.value : ''}*/\n`;
    }
  }
  return out;
}

/**
 * Resolve an inlined-ref id to its target schema, cache an import entry for it,
 * and return the JS identifier (`uniqueName`) the caller should emit at the
 * reference site. Subsequent calls with the same id reuse the cached entry,
 * so each referenced schema is imported once per generated file.
 */
function registerImport(id: string, ctx: EmitContext): string {
  const cached = ctx.imports.get(id);
  if (cached) return cached.uniqueName;

  const meta = ctx.schemaMetaDataMap.get(id);
  /* v8 ignore if -- @preserve */
  if (!meta) {
    throw new Error(
      `[openapi-ts-json-schema] No matching schema found for id "${id}" in "schemaMetaDataMap". Ensure the schema is included in "targets".`,
    );
  }

  const entry: EmittedImport = {
    uniqueName: meta.uniqueName,
    importPath: makeRelativeImportPath({
      fromDirectory: ctx.absoluteDirName,
      toModule: meta.absoluteImportPath,
      moduleSystem: ctx.moduleSystem,
    }),
  };

  ctx.imports.set(id, entry);
  return entry.uniqueName;
}

/**
 * Recursive emitter: converts a JSON-schema-shaped value into a TypeScript
 * expression string. Handles inlined-ref markers (per `refHandling`), primitives,
 * arrays, and objects. `ancestors` tracks the active parent chain so cycles can
 * be short-circuited to `{}` instead of recursing forever.
 */
function emitNode({
  node,
  ctx,
  ancestors,
}: {
  node: unknown;
  ctx: EmitContext;
  ancestors: Set<object>;
}): string {
  // Inlined-ref nodes resolve to either an identifier (import) or a $ref literal (keep)
  const id = getId(node);

  if (id) {
    if (ctx.refHandling === 'import') {
      return registerImport(id, ctx);
    }

    if (ctx.refHandling === 'keep') {
      return `{ $ref: ${JSON.stringify(ctx.idMapper({ id }))} }`;
    }
  }

  if (node === null) return 'null';
  if (typeof node === 'string') return JSON.stringify(node);
  if (typeof node === 'number') return String(node);
  if (typeof node === 'boolean') return node ? 'true' : 'false';
  if (typeof node !== 'object') return 'null';

  // Cyclic occurrences collapse to "{}"
  if (ancestors.has(node)) {
    return '{}';
  }

  ancestors.add(node);

  let result: string;
  if (Array.isArray(node)) {
    const items: string[] = [];
    for (const value of node) {
      if (
        value === undefined ||
        typeof value === 'function' ||
        typeof value === 'symbol'
      ) {
        continue;
      }
      items.push(emitNode({ node: value, ctx, ancestors }));
    }
    result = `[${items.join(',')}]`;
  } else {
    const entries: string[] = [];
    for (const [key, value] of Object.entries(node)) {
      if (
        value === undefined ||
        typeof value === 'function' ||
        typeof value === 'symbol'
      ) {
        continue;
      }
      entries.push(
        `${JSON.stringify(key)}: ${emitNode({ node: value, ctx, ancestors })}`,
      );
    }
    const leading = renderLeadingComment(node);
    if (entries.length === 0 && leading === '') {
      result = '{}';
    } else {
      // Newlines around the body keep Prettier from collapsing the object onto a single line
      result = `{\n${leading}${entries.join(',\n')}\n}`;
    }
  }

  ancestors.delete(node);
  return result;
}

/**
 * Format the collected imports into the leading import block of the generated
 * file. Order is reversed at render time — see comment below for why.
 */
function renderImports(imports: Map<string, EmittedImport>): string {
  if (imports.size === 0) return '';
  // Reverse insertion order to match the prior pipeline's output (which prepended each
  // statement). Prettier's import-sort plugin doesn't reorder same-group imports, so this
  // ordering shows up verbatim in generated files and is locked in by snapshot-style tests.
  const entries = [...imports.values()].reverse();
  return (
    entries
      .map((e) => `import ${e.uniqueName} from "${e.importPath}"`)
      .join('\n') + '\n'
  );
}

/**
 * Walk a (dereferenced) JSON schema and emit TypeScript source for it.
 *
 * - Inlined refs marked with SCHEMA_ID_SYMBOL become either identifier
 *   references (refHandling: "import") or "{ $ref: ... }" literals
 *   (refHandling: "keep"). In "inline" mode the marker is ignored.
 * - Circular nodes are emitted as "{}" (matches the prior behaviour).
 * - Leading comments attached via comment-json's COMMENT_JSON_BEFORE_SYMBOL
 *   are rendered as JS comments inside the relevant object literal.
 */
export function emitTsSchema({
  rootSchema,
  refHandling,
  schemaMetaDataMap,
  absoluteDirName,
  moduleSystem,
  idMapper,
}: {
  rootSchema: unknown;
  refHandling: RefHandling;
  schemaMetaDataMap: SchemaMetaDataMap;
  absoluteDirName: string;
  moduleSystem: ModuleSystem;
  idMapper: IdMapper;
}): { body: string; imports: string; isImportAlias: boolean } {
  const ctx: EmitContext = {
    refHandling,
    imports: new Map(),
    schemaMetaDataMap,
    absoluteDirName,
    moduleSystem,
    idMapper,
  };

  const isImportAlias =
    refHandling === 'import' && getId(rootSchema) !== undefined;

  const body = emitNode({ node: rootSchema, ctx, ancestors: new Set() });
  const imports = renderImports(ctx.imports);

  return { body, imports, isImportAlias };
}
