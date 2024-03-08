import mapObject from 'map-obj';
import { fromSchema } from '@openapi-contrib/openapi-schema-to-json-schema';
import { isObject } from './';
import type { OpenApiSchema, JSONSchema } from '../types';

const SECURITY_SCHEME_OBJECT_TYPES = [
  'apiKey',
  'http',
  'mutualTLS',
  'oauth2',
  'openIdConnect',
];

function convertToJsonSchema<Value extends unknown>(
  value: Value,
): JSONSchema | Value {
  if (!isObject(value)) {
    return value;
  }

  /**
   * type as array is not a valid OpenAPI value
   * https://swagger.io/docs/specification/data-models/data-types#mixed-types
   */
  if (Array.isArray(value.type)) {
    return value;
  }

  /**
   * Skip parameters
   */
  if ('in' in value) {
    return value;
  }

  /**
   * Skip security scheme object definitions
   * https://swagger.io/specification/#security-scheme-object
   */
  if (
    typeof value.type === 'string' &&
    SECURITY_SCHEME_OBJECT_TYPES.includes(value.type)
  ) {
    return value;
  }

  const schema = fromSchema(value);
  // $schema is appended by @openapi-contrib/openapi-schema-to-json-schema
  delete schema.$schema;
  return schema;
}

/**
 * Traverse the openAPI schema tree an brutally try to convert
 * everything possible to JSON schema. We are probably overdoing since we process any object
 * @TODO Find a cleaner way to convert to JSON schema all the existing OpenAPI schemas
 * @NOTE We are currently skipping arrays
 */
export function convertOpenApiToJsonSchema(
  schema: OpenApiSchema,
): Record<string, unknown> {
  return mapObject(
    schema,
    (key, value) => {
      return [key, convertToJsonSchema(value)];
    },
    { deep: true },
  );
}
