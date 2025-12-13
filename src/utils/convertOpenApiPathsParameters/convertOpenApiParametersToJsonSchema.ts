import {
  type OpenAPIParametersAsJSONSchema,
  convertParametersToJSONSchema,
} from 'openapi-jsonschema-parameters';

import type { OpenApiParameter } from '../../types.js';

export type OpenApiParametersAsJsonSchema = OpenAPIParametersAsJSONSchema;

/**
 * Convert OpenAPI parameter arrays
 * into records of JSON schemas organized by "in" value
 */
export function convertOpenApiParametersToJsonSchema(
  openApiParameters: OpenApiParameter[],
): OpenApiParametersAsJsonSchema {
  // @ts-expect-error openapi3-ts types seem to conflict with openapi-jsonschema-parameters ones
  const parameters = convertParametersToJSONSchema(openApiParameters);

  // Append "type" prop which "openapi-jsonschema-parameters" seems to omit
  let paramName: keyof OpenApiParametersAsJsonSchema;
  for (paramName in parameters) {
    const schema = parameters[paramName];
    if (schema && !schema.type) {
      schema.type = 'object';
    }
  }
  return parameters;
}
