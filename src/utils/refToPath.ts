import path from 'node:path';

/**
 * Parses OpenAPI local refs (#/components/schema/Foo) to the derive the expected schema output path
 * this library saves generated JSON schemas to (...outputPath/components.schema/Foo)
 *
 * @NOTE Remote and url refs should have been already resolved and inlined
 */
export function refToPath(ref: string): {
  schemaRelativePath: string;
  schemaRelativeDirName: string;
  schemaName: string;
} {
  /* istanbul ignore if: if this condition was true the execution would break before getting to this line -- @preserve */
  if (!ref.startsWith('#/')) {
    throw new Error(`[openapi-ts-json-schema] Unsupported ref value: "${ref}"`);
  }

  const refPath = ref.replace('#/', '');
  const schemaName = path.basename(refPath);
  const schemaRelativeDirName = path.dirname(refPath);

  return {
    schemaRelativePath: path.join(schemaRelativeDirName, schemaName),
    schemaRelativeDirName,
    schemaName,
  };
}
