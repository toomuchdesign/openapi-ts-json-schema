import mapObject from 'map-obj';
import { JSONSchema, refToPlaceholder, REF_SYMBOL } from '.';

function isObject(value: unknown): value is Record<string | symbol, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Get if an object holds a REF_SYMBOL prop
 */
function isInlinedRefSchema(
  schema: JSONSchema,
): schema is Record<string | symbol, JSONSchema> {
  return isObject(schema) && REF_SYMBOL in schema;
}

/**
 * Retrieve REF_SYMBOL prop value
 */
function getRef(schema: JSONSchema): string {
  if (REF_SYMBOL in schema && typeof schema[REF_SYMBOL] === 'string') {
    return schema[REF_SYMBOL];
  }
  throw new Error('Expected Ref value not found in schema');
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
      if (isInlinedRefSchema(value)) {
        const ref = getRef(value);
        return [key, refToPlaceholder(ref)];
      }
      return [key, value];
    },
    { deep: true },
  );
}
