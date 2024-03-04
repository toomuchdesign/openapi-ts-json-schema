import { REF_SYMBOL } from '..';
import { isObject } from '../';

/**
 * Retrieve REF_SYMBOL prop value
 */
export function getRef(node: unknown): string | undefined {
  if (
    isObject(node) &&
    REF_SYMBOL in node &&
    typeof node[REF_SYMBOL] === 'string'
  ) {
    return node[REF_SYMBOL];
  }
  return undefined;
}
