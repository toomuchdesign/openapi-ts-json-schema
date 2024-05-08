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

  try {
    const schema = fromSchema(value, { strictMode: false });
    // $schema is appended by @openapi-contrib/openapi-schema-to-json-schema
    delete schema.$schema;
    return schema;
  } catch (error) {
    /* v8 ignore next 1 */
    const errorMessage = error instanceof Error ? error.message : '';
    throw new Error(
      `[openapi-ts-json-schema] OpenApi to JSON schema conversion failed: "${errorMessage}"`,
      { cause: value },
    );
  }
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
      // @NOTE map-obj transforms only arrays entries which are objects
      return [key, convertToJsonSchema(value)];
    },
    { deep: true },
  );
}
