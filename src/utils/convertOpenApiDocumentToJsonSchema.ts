import { fromSchema } from '@openapi-contrib/openapi-schema-to-json-schema';
import mapObject from 'map-obj';

import type { JSONSchema, OpenApiDocument } from '../types.js';
import { isObject, isOpenApiParameterObject } from './index.js';

function convertToJsonSchema<Value extends unknown>(
  value: Value,
): JSONSchema | Value {
  if (!isObject(value)) {
    return value;
  }

  /**
   * Skip openAPI parameters since conversion causes data loss (they are not valid JSON schema)
   * which makes impossible to aggregate them into JSON schema.
   *
   * Conversion is carried out later with "convertOpenApiPathsParameters"
   */
  if (isOpenApiParameterObject(value)) {
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
 * Traverse the openAPI schema tree an brutally try to convert every oas definition
 * to JSON schema. We are probably overdoing since we process any found object.
 *
 * - Is there a way to tell an OpenAPI definition objects convertible to JSON schema from the others?
 * - Could we explicitly convert only the properties that need it?
 *
 * @TODO Find a nicer way to convert convert all the expected OpenAPI schemas
 */
export function convertOpenApiDocumentToJsonSchema(
  schema: OpenApiDocument,
): OpenApiDocument {
  return mapObject(
    schema,
    (key, value) => {
      /**
       * @NOTE map-obj only processes object values separately
       */
      if (Array.isArray(value)) {
        return [key, value.map((entry) => convertToJsonSchema(entry))];
      }

      // @NOTE map-obj transforms only arrays entries which are objects
      return [key, convertToJsonSchema(value)];
    },
    { deep: true },
  );
}
