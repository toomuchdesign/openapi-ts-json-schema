import mapObject from 'map-obj';
import { JSONSchema, refToPlaceholder, REF_SYMBOL } from '.';

function isObject(value: unknown): value is Record<string | symbol, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Retrieve REF_SYMBOL prop value
 */
function getRef(schema: unknown): string | undefined {
  if (
    isObject(schema) &&
    REF_SYMBOL in schema &&
    typeof schema[REF_SYMBOL] === 'string'
  ) {
    return schema[REF_SYMBOL];
  }
  return undefined;
}

/**
 * Get any entity and:
 * - Return ref placeholder is the entity is an object with REF_SYMBOL prop
 * - Return provided entity in al other cased
 */
function replaceInlinedSchemaWithPlaceholder<Entry extends unknown>(
  entry: Entry,
): Entry | string {
  const ref = getRef(entry);
  if (ref === undefined) {
    return entry;
  }
  return refToPlaceholder(ref);
}

/**
 * Iterate a JSON schema to find inlined ref schema objects.
 * Inlined ref schemas objects are marked with a property key set as REF_SYMBOL.
 * Replace the object with a string placeholder with a reference to the $ref value
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
