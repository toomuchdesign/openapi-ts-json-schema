import mapObject from 'map-obj';
import { refToPlaceholder } from '..';
import { getRef } from './getRef';
import type { JSONSchema, JSONSchemaWithPlaceholders } from '../../types';

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
 * with a string placeholder with a reference to the original $ref value ("_OTJS-START_#/ref/value_OTJS-END_")
 */
export function replaceInlinedRefsWithStringPlaceholder(
  schema: JSONSchema,
): JSONSchemaWithPlaceholders {
  if (getRef(schema)) {
    return replaceInlinedSchemaWithPlaceholder(schema);
  }

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
