import {
  convertParametersToJSONSchema as _convertParametersToJSONSchema,
  OpenAPIParametersAsJSONSchema,
} from 'openapi-jsonschema-parameters';
import type { JSONSchema } from '../types';

type OpenAPIParameters = Parameters<typeof _convertParametersToJSONSchema>[0];
function convertParametersToJSONSchema(
  openApiParameters: OpenAPIParameters,
): OpenAPIParametersAsJSONSchema {
  const parameters = _convertParametersToJSONSchema(openApiParameters);

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
 * Parameters field can only be found in:
 * - paths[path].parameters
 * - paths[path][operation].parameters
 *
 * https://swagger.io/docs/specification/describing-parameters/
 */
export function convertOpenApiParameters(schema: JSONSchema): JSONSchema {
  if ('paths' in schema) {
    for (const path in schema.paths) {
      const pathSchema = schema.paths[path];

      /**
       * Path level parameters
       * These could be merged with operation params:
       * https://swagger.io/docs/specification/describing-parameters/#common
       */
      if ('parameters' in pathSchema) {
        pathSchema.parameters = convertParametersToJSONSchema(
          pathSchema.parameters,
        );
      }

      // Operation level parameters
      for (const operation in pathSchema) {
        const operationSchema = pathSchema[operation];
        if ('parameters' in operationSchema) {
          operationSchema.parameters = convertParametersToJSONSchema(
            operationSchema.parameters,
          );
        }
      }
    }
  }

  return schema;
}
