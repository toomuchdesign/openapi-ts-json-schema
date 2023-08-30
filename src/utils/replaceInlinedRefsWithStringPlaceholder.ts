import mapObject from 'map-obj';
import { JSONSchema, refToPlaceholder, REF_SYMBOL } from '.';

function isObject(value: unknown): value is Record<string | symbol, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Retrieve REF_SYMBOL prop value
 */
function getRef(node: unknown): string | undefined {
  if (
    isObject(node) &&
    REF_SYMBOL in node &&
    typeof node[REF_SYMBOL] === 'string'
  ) {
    return node[REF_SYMBOL];
  }
  return undefined;
}

/**
 * Get any JSON schema node and:
 * - Return ref placeholder is the entity is an inlined ref schema objects (with REF_SYMBOL prop)
 * - Return provided node in all other cases
 */
function replaceInlinedSchemaWithPlaceholder<Node extends unknown>(
  node: Node,
): Node | string {
  const ref = getRef(node);
  if (ref === undefined) {
    return node;
  }
  return refToPlaceholder(ref);
}

/**
 * Iterate a JSON schema to replace inlined ref schema objects
 * (marked with a REF_SYMBOL property holding the original $ref value)
 * with a string placeholder with a reference to the original $ref value
 */
export function replaceInlinedRefsWithStringPlaceholder(
  schema: JSONSchema,
): JSONSchema {
  return mapObject(
    schema,
    (key, value) => {
      if (Array.isArray(value)) {
        return [
          key,
          value.map((entry) => replaceInlinedSchemaWithPlaceholder(entry)),
        ];
      }

      return [key, replaceInlinedSchemaWithPlaceholder(value)];
    },
    { deep: true },
  );
}
