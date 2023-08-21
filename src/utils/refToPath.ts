import path from 'node:path';

/**
 * Parses OpenAPI refs (#/components/schema/Foo) to the derive the same output path patterns
 * this library saves generated JSON schemas to (...outputPath/components.schema/Foo)
 *
 * @NOTE We are just supporting `/#` like refs as initial implementation
 */
export function refToPath({
  ref,
  outputPath,
}: {
  ref: string;
  outputPath: string;
}): {
  schemaName: string;
  schemaOutputPath: string;
} {
  /* istanbul ignore if: if this condition was true the execution would break before getting to this line -- @preserve */
  if (!ref.startsWith('#/')) {
    throw new Error(`[openapi-ts-json-schema] Unsupported ref value: "${ref}"`);
  }

  const refPath = ref.replace('#/', '');
  const relativePath = path.dirname(refPath).replaceAll('/', '.');

  return {
    schemaName: path.basename(refPath),
    schemaOutputPath: path.resolve(outputPath, relativePath),
  };
}
