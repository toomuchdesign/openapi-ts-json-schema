import { LEADING_COMMENT_SYMBOL } from '../../constants.js';
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

/**
 * Render the leading line-comment string attached to a node (if any) as a
 * JS `//` comment. Returns an empty string when no comment is present.
 */
function renderLeadingComment(node: object): string {
  const comment = (node as Record<symbol, unknown>)[LEADING_COMMENT_SYMBOL];
  return typeof comment === 'string' ? `//${comment}\n` : '';
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
function emitNodeString({
  node,
  ctx,
  ancestors,
}: {
  node: unknown;
  ctx: EmitContext;
  ancestors: Set<object>;
}): string {
  const id = getId(node);

  // Handling a previously inlined dereferenced node
  if (id) {
    if (ctx.refHandling === 'import') {
      return registerImport(id, ctx);
    }

    // Restore the $ref
    if (ctx.refHandling === 'keep') {
      return `{ $ref: ${JSON.stringify(ctx.idMapper({ id }))} }`;
    }
  }

  if (
    node === undefined ||
    node === null ||
    typeof node === 'string' ||
    typeof node === 'number' ||
    typeof node === 'boolean'
  ) {
    return JSON.stringify(node);
  }

  // Cyclic occurrences collapse to "{}"
  if (ancestors.has(node)) {
    return '{}';
  }

  ancestors.add(node);
  let result: string;

  if (Array.isArray(node)) {
    const items = node.map((value) =>
      emitNodeString({ node: value, ctx, ancestors }),
    );
    result = `[${items.join(',')}]`;
  }

  // node is record
  else {
    const entries: string[] = [];
    for (const [key, value] of Object.entries(node)) {
      entries.push(
        `${JSON.stringify(key)}: ${emitNodeString({ node: value, ctx, ancestors })}`,
      );
    }
    const leading = renderLeadingComment(node);
    result = `{\n${leading}${entries.join(',\n')}\n}`;
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
 * - Inlined refs marked with REFERENCED_SCHEMA_ID_SYMBOL become either identifier
 *   references (refHandling: "import") or "{ $ref: ... }" literals
 *   (refHandling: "keep"). In "inline" mode the marker is ignored.
 * - Circular nodes are emitted as "{}" (matches the prior behaviour).
 * - Leading comments attached via LEADING_COMMENT_SYMBOL
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

  const body = emitNodeString({ node: rootSchema, ctx, ancestors: new Set() });
  const imports = renderImports(ctx.imports);

  return { body, imports, isImportAlias };
}
