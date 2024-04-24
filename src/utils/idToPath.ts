import path from 'node:path';
import { parseId } from './';

/**
 * Parses internal schema ids (/components/schema/Foo) to the derive the expected schema output path
 * this library saves generated JSON schemas to (...outputPath/components.schema/Foo)
 */
export function idToPath(id: string): {
  schemaRelativeDirName: string;
  schemaName: string;
} {
  const idPath = parseId(id);
  return {
    schemaRelativeDirName: path.dirname(idPath),
    schemaName: path.basename(idPath),
  };
}
