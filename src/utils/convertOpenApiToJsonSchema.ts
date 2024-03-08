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
   * Skip parameter objects
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
 * Traverse the openAPI schema tree an brutally try to convert everything
 * possible to JSON schema. We are probably overdoing since we process any object we find.
 *
 * - Is there a way to tell an OpenAPI schema objects convertible to JSON schema from the others?
 * - Could we explicitly convert only the properties where we know conversion is needed?
 *
 * @TODO Find a nicer way to convert convert all the expected OpenAPI schemas
 */
export function convertOpenApiToJsonSchema(
  schema: OpenApiSchema,
): Record<string, unknown> {
  return mapObject(
    schema,
    (key, value) => {
      if (Array.isArray(value)) {
        return [key, value.map((entry) => convertToJsonSchema(entry))];
      }

      return [key, convertToJsonSchema(value)];
    },
    { deep: true },
  );
}
