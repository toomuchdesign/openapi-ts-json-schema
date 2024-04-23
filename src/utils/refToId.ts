import { parseRef } from '.';

/**
 * Generate an internal schema ID from a given schema ref:
 * "#/components/schema/Foo" --> "/components/schema/Foo"
 */
export function refToId(ref: string): string {
  const refPath = parseRef(ref);
  return `/${refPath}`;
}
