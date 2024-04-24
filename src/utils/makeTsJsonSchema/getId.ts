import { SCHEMA_ID_SYMBOL, isObject } from '..';

/**
 * Retrieve SCHEMA_ID_SYMBOL prop value
 */
export function getId(node: unknown): string | undefined {
  if (
    isObject(node) &&
    SCHEMA_ID_SYMBOL in node &&
    typeof node[SCHEMA_ID_SYMBOL] === 'string'
  ) {
    return node[SCHEMA_ID_SYMBOL];
  }
  return undefined;
}
