import type { OpenApiDocument } from '../../types.js';
import { convertOpenApiParametersToJsonSchema } from './convertOpenApiParametersToJsonSchema.js';

/**
 * Convert parameter arrays found in:
 * - paths[path].parameters
 * - paths[path][operation].parameters
 *
 * ..into records of JSON schemas organized by "in" value
 *
 * Parameters schema $refs are fully supported
 * $ref parameters are currently always inlined
 *
 * OpenAPI parameters docs:
 * https://swagger.io/docs/specification/describing-parameters/
 *
 * @NOTE The schema must be dereferenced since openapi-jsonschema-parameters doesn't handle $refs
 */
export function convertOpenApiPathsParameters(
  schema: OpenApiDocument,
): OpenApiDocument {
  if (schema.paths) {
    for (const path in schema.paths) {
      const pathSchema = schema.paths[path];

      if (pathSchema) {
        /**
         * Common path parameters
         * https://swagger.io/docs/specification/describing-parameters/#common-for-path
         */
        const originalPathParameters = pathSchema.parameters ?? [];

        if (pathSchema.parameters) {
          // @ts-expect-error we are replacing OAS parameters array with JSON Schema record
          pathSchema.parameters = convertOpenApiParametersToJsonSchema(
            pathSchema.parameters,
          );
        }

        /**
         * Operation path parameters
         * https://swagger.io/docs/specification/describing-parameters/#path-parameters
         */
        for (const operation in pathSchema) {
          const operationSchema =
            pathSchema[operation as keyof typeof pathSchema];

          if (operationSchema.parameters) {
            // Merge operation and common path parameters
            operationSchema.parameters = convertOpenApiParametersToJsonSchema([
              ...originalPathParameters,
              ...operationSchema.parameters,
            ]);
          }
        }
      }
    }
  }

  return schema;
}
