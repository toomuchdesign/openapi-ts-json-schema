import get from 'lodash.get';

import type { OpenApiDocument } from '../types.js';
import { isObject } from './isObject.js';

/**
 * Validate that `targets.single` and `targets.collections` resolve to
 * shapes the generator can handle.
 *
 * - Throws if a target path does not resolve to an object.
 * - Throws if a `collections` target resolves to a record whose direct
 *   children are not all objects (catches passing a leaf schema where a
 *   record-of-schemas is expected).
 */
export function validateTargets({
  document,
  targets,
}: {
  document: OpenApiDocument;
  targets: { single: string[]; collections: string[] };
}): void {
  for (const targetPath of targets.single) {
    const value = get(document, targetPath);

    if (!isObject(value)) {
      throw new Error(
        `[openapi-ts-json-schema] "targets.single" target "${targetPath}" must resolve to an object.`,
      );
    }
  }

  for (const targetPath of targets.collections) {
    const value = get(document, targetPath);

    if (!isObject(value)) {
      throw new Error(
        `[openapi-ts-json-schema] "targets.collections" target "${targetPath}" must resolve to an object.`,
      );
    }

    for (const [childKey, childValue] of Object.entries(value)) {
      if (!isObject(childValue)) {
        throw new Error(
          `[openapi-ts-json-schema] "targets.collections" target "${targetPath}" must be a record of definition objects, but child "${childKey}" is not an object. Did you mean to use "targets.single"?`,
        );
      }
    }
  }
}
