/**
 * Parses internal schema ids:
 * "/components/schema/Foo" --> "components/schema/Foo"
 */
export function parseId(id: string): string {
  if (!id.startsWith('/')) {
    throw new Error(`[openapi-ts-json-schema] Unsupported id value: "${id}"`);
  }

  const idPath = id.replace('/', '');
  return idPath;
}
