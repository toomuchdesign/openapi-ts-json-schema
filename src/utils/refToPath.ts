import path from 'node:path';
import { parseRef } from '.';

/**
 * Parses OpenAPI local refs (#/components/schema/Foo) to the derive the expected schema output path
 * this library saves generated JSON schemas to (...outputPath/components.schema/Foo)
 *
 * @NOTE Remote and url refs should have been already resolved and inlined
 */
export function refToPath(ref: string): {
  schemaRelativeDirName: string;
  schemaName: string;
} {
  const refPath = parseRef(ref);
  return {
    schemaRelativeDirName: path.dirname(refPath),
    schemaName: path.basename(refPath),
  };
}
