import mapObject from 'map-obj';
import { idToPlaceholder } from '..';
import { getId } from './getId';
import type { JSONSchema, JSONSchemaWithPlaceholders } from '../../types';

/**
 * Get any JSON schema node and:
 * - Return ref placeholder is the entity is an inlined ref schema objects (with SCHEMA_ID_SYMBOL prop)
 * - Return provided node in all other cases
 */
function replaceInlinedSchemaWithPlaceholder<Node extends unknown>(
  node: Node,
): Node | string {
  const id = getId(node);
  if (id === undefined) {
    return node;
  }
  return idToPlaceholder(id);
}

/**
 * Iterate a JSON schema to replace inlined ref schema objects
 * (marked with a SCHEMA_ID_SYMBOL property holding the original $ref value)
 * with a string placeholder with a reference to the original $ref value ("_OTJS-START_/id/value_OTJS-END_")
 */
export function replaceInlinedRefsWithStringPlaceholder(
  schema: JSONSchema,
): JSONSchemaWithPlaceholders {
  if (getId(schema)) {
    return replaceInlinedSchemaWithPlaceholder(schema);
  }

  return mapObject(
    schema,
    (key, value) => {
      // @NOTE map-obj transforms only arrays entries which are objects
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
