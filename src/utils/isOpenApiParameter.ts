import { isObject } from '.';
('./');

const PARAMETERS_IN_VALUES = [
  'query',
  'header',
  'path',
  'cookie',
  'formData',
  'body',
];

/**
 * Detect OpenAPI parameters
 * https://swagger.io/docs/specification/describing-parameters/
 */
export function isOpenApiParameter(schema: unknown): boolean {
  if (
    isObject(schema) &&
    typeof schema.in === 'string' &&
    PARAMETERS_IN_VALUES.includes(schema.in)
  ) {
    return true;
  }

  return false;
}
