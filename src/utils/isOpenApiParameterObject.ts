import type { ParameterObject } from 'openapi3-ts/oas31';

import { isObject } from './index.js';

const PARAMETERS_IN_VALUES = [
  'query',
  'path',
  'header',
  'cookie',
  // oas 2 parameters
  'formData',
  'body',
];

/**
 * Detect OpenAPI parameters
 * https://swagger.io/docs/specification/describing-parameters/
 */
export function isOpenApiParameterObject(
  schema: unknown,
): schema is ParameterObject {
  if (
    isObject(schema) &&
    typeof schema.name === 'string' &&
    typeof schema.in === 'string' &&
    PARAMETERS_IN_VALUES.includes(schema.in)
  ) {
    return true;
  }

  return false;
}
