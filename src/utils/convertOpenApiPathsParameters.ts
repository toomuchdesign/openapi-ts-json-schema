import {
  convertParametersToJSONSchema,
  OpenAPIParametersAsJSONSchema,
} from 'openapi-jsonschema-parameters';
import type { JSONSchema } from '../types';

type OpenAPIParameters = Parameters<typeof convertParametersToJSONSchema>[0];

function convertParametersToJsonSchema(
  openApiParameters: OpenAPIParameters,
): OpenAPIParametersAsJSONSchema {
  const parameters = convertParametersToJSONSchema(openApiParameters);

  // Append "type" prop which "openapi-jsonschema-parameters" seems to omit
  let paramName: keyof OpenAPIParametersAsJSONSchema;
  for (paramName in parameters) {
    const schema = parameters[paramName];
    if (schema && !schema.type) {
      schema.type = 'object';
    }
  }
  return parameters;
}

/**
 * Convert parameters found in:
 * - paths[path].parameters
 * - paths[path][operation].parameters
 *
 * Shared $ref parameters are currently always inlined
 *
 * OpenAPI parameters docs:
 * https://swagger.io/docs/specification/describing-parameters/
 *
 * @NOTE The schema must be dereferenced since openapi-jsonschema-parameters doesn't handle $refs
 */
export function convertOpenApiPathsParameters(schema: JSONSchema): JSONSchema {
  if ('paths' in schema) {
    for (const path in schema.paths) {
      const pathSchema = schema.paths[path];

      /**
       * Common path parameters
       * https://swagger.io/docs/specification/describing-parameters/#common-for-path
       */
      const pathParameters =
        'parameters' in pathSchema ? pathSchema.parameters : [];

      if (pathParameters.length) {
        pathSchema.parameters = convertParametersToJsonSchema(
          pathSchema.parameters,
        );
      }

      /**
       * Operation path parameters
       * https://swagger.io/docs/specification/describing-parameters/#path-parameters
       */
      for (const operation in pathSchema) {
        const operationSchema = pathSchema[operation];
        if ('parameters' in operationSchema) {
          // Merge operation and common path parameters
          operationSchema.parameters = convertParametersToJsonSchema([
            ...pathParameters,
            ...operationSchema.parameters,
          ]);
        }
      }
    }
  }

  return schema;
}
