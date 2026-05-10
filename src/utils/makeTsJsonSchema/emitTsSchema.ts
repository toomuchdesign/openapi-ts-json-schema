import { LEADING_COMMENT_SYMBOL } from '../../constants.js';
import type {
  IdMapper,
  ImportExtension,
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
  importExtension: ImportExtension;
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
      importExtension: ctx.importExtension,
    }),
  };

  ctx.imports.set(id, entry);
  return entry.uniqueName;
}

/**
 * Recursive emitter: converts a JSON-schema-shaped value into a TypeScript
 * expression string. Handles inlined-ref markers (per `refHandling`), primitives,
 * arrays, and objects. `ancestorIds` tracks the active chain of id-bearing
 * (dereferenced-ref) ancestors — those are the only nodes that can introduce
 * cycles, since the ref-parser is what shares schema instances across the tree.
 * When a id reappears in its own ancestor chain the recursion short-circuits
 * with a comment that names the offending schema directly.
 */
function emitNodeString({
  node,
  ctx,
  ancestorIds,
}: {
  node: unknown;
  ctx: EmitContext;
  ancestorIds: Set<string>;
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

    // refHandling === 'inline': only id-bearing nodes can produce cycles, so
    // detect them here and emit the truncation annotated with the schema's
    // own id. Preserve any leading $ref comment attached to the node.
    if (ancestorIds.has(id)) {
      const leading = renderLeadingComment(
        // @ts-expect-error node is currently unknown, but the presence of an id guarantees it's a record with symbol-keyed properties
        node,
      );

      return `{\n${leading}// Circular recursion interrupted\n}`;
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

  if (id) {
    ancestorIds.add(id);
  }

  let result: string;

  if (Array.isArray(node)) {
    const items = node.map((value) =>
      emitNodeString({ node: value, ctx, ancestorIds }),
    );
    result = `[${items.join(',')}]`;
  }

  // node is record
  else {
    const entries: string[] = [];
    for (const [key, value] of Object.entries(node)) {
      entries.push(
        `${JSON.stringify(key)}: ${emitNodeString({ node: value, ctx, ancestorIds })}`,
      );
    }
    const leading = renderLeadingComment(node);
    result = `{\n${leading}${entries.join(',\n')}\n}`;
  }

  if (id) {
    ancestorIds.delete(id);
  }
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
 *   (refHandling: "keep"). In "inline" mode the marker drives cycle detection.
 * - In "inline" mode, a cycle between dereferenced schemas is short-circuited
 *   the second time the same id appears in the active ancestor chain; the
 *   truncation is annotated with that id.
 * - Leading comments attached via LEADING_COMMENT_SYMBOL
 *   are rendered as JS comments inside the relevant object literal.
 */
export function emitTsSchema({
  rootSchema,
  refHandling,
  schemaMetaDataMap,
  absoluteDirName,
  importExtension,
  idMapper,
}: {
  rootSchema: unknown;
  refHandling: RefHandling;
  schemaMetaDataMap: SchemaMetaDataMap;
  absoluteDirName: string;
  importExtension: ImportExtension;
  idMapper: IdMapper;
}): { body: string; imports: string; isImportAlias: boolean } {
  const ctx: EmitContext = {
    refHandling,
    imports: new Map(),
    schemaMetaDataMap,
    absoluteDirName,
    importExtension,
    idMapper,
  };

  const isImportAlias =
    refHandling === 'import' && getId(rootSchema) !== undefined;

  const body = emitNodeString({
    node: rootSchema,
    ctx,
    ancestorIds: new Set(),
  });
  const imports = renderImports(ctx.imports);

  return { body, imports, isImportAlias };
}
