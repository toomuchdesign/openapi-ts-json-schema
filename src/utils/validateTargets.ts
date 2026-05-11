import get from 'lodash.get';

import type { OpenApiDocument } from '../types.js';
import { isObject } from './isObject.js';

function describeValue(value: unknown): string {
  if (Array.isArray(value)) return 'an array';
  if (value === null) return 'null';
  return `a ${typeof value}`;
}

/**
 * Validate that `targets.single` and `targets.collections` resolve to
 * shapes the generator can handle.
 *
 * - Throws "target not found" if a path resolves to `undefined` or `null`.
 * - Throws if a target resolves to a non-object (primitive or array).
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

    if (!value) {
      throw new Error(
        `[openapi-ts-json-schema] target not found in OAS definition: "${targetPath}". Check that the path exists in your OpenAPI document.`,
      );
    }

    if (!isObject(value)) {
      throw new Error(
        `[openapi-ts-json-schema] "targets.single" target "${targetPath}" must resolve to an object, got ${describeValue(value)}.`,
      );
    }
  }

  for (const targetPath of targets.collections) {
    const value = get(document, targetPath);

    if (!value) {
      throw new Error(
        `[openapi-ts-json-schema] target not found in OAS definition: "${targetPath}". Check that the path exists in your OpenAPI document.`,
      );
    }

    if (!isObject(value)) {
      throw new Error(
        `[openapi-ts-json-schema] "targets.collections" target "${targetPath}" must resolve to an object, got ${describeValue(value)}.`,
      );
    }

    for (const [childKey, childValue] of Object.entries(value)) {
      if (!isObject(childValue)) {
        throw new Error(
          `[openapi-ts-json-schema] "targets.collections" target "${targetPath}" must be a record of definition objects, but child "${childKey}" is ${describeValue(childValue)}. Did you mean to use "targets.single"?`,
        );
      }
    }
  }
}
