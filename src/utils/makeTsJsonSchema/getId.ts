import { REFERENCED_SCHEMA_ID_SYMBOL, isObject } from '../index.js';

/**
 * Retrieve REFERENCED_SCHEMA_ID_SYMBOL prop value
 */
export function getId(node: unknown): string | undefined {
  if (
    isObject(node) &&
    REFERENCED_SCHEMA_ID_SYMBOL in node &&
    typeof node[REFERENCED_SCHEMA_ID_SYMBOL] === 'string'
  ) {
    return node[REFERENCED_SCHEMA_ID_SYMBOL];
  }
  return undefined;
}
