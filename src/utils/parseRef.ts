/**
 * Parses OpenApi ref:
 * "#/components/schema/Foo" --> "components/schema/Foo"
 */
export function parseRef(ref: string): string {
  if (!ref.startsWith('#/')) {
    throw new Error(`[openapi-ts-json-schema] Unsupported ref value: "${ref}"`);
  }

  const refPath = ref.replace('#/', '');
  return refPath;
}
