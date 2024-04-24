/**
 * Parses OpenApi ref:
 * "#/components/schema/Foo" --> "components/schema/Foo"
 */
function parseRef(ref: string): string {
  if (!ref.startsWith('#/')) {
    throw new Error(`[openapi-ts-json-schema] Unsupported ref value: "${ref}"`);
  }

  const refPath = ref.replace('#/', '');
  return refPath;
}

/**
 * Generate an internal schema ID from a given schema ref:
 * "#/components/schema/Foo" --> "/components/schema/Foo"
 */
export function refToId(ref: string): string {
  const refPath = parseRef(ref);
  return `/${refPath}`;
}
