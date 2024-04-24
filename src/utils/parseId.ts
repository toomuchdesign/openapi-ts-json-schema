import path from 'node:path';

/**
 * Parses internal schema ids (/components/schema/Foo) to the derive the expected schema output path
 * this library saves generated JSON schemas to (...outputPath/components.schema/Foo)
 */
export function parseId(id: string): {
  schemaRelativeDirName: string;
  schemaName: string;
} {
  if (!id.startsWith('/')) {
    throw new Error(`[openapi-ts-json-schema] Unsupported id value: "${id}"`);
  }

  const idPath = id.replace('/', '');

  return {
    schemaRelativeDirName: path.dirname(idPath),
    schemaName: path.basename(idPath),
  };
}
