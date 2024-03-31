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

  if ('type' in value) {
    /**
     * Skip entities with "type" props defined and not a string
     * (They should have already been converted, anyway)
     * https://github.com/toomuchdesign/openapi-ts-json-schema/issues/211
     */
    if (typeof value.type !== 'string') {
      return value;
    }

    /**
     * Skip security scheme object definitions
     * https://swagger.io/specification/#security-scheme-object
     */
    if (SECURITY_SCHEME_OBJECT_TYPES.includes(value.type)) {
      return value;
    }
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
