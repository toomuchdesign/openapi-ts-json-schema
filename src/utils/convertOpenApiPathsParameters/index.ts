import { convertOpenApiParametersToJsonSchema } from './convertOpenApiParametersToJsonSchema';
import type { JSONSchema } from '../../types';

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
        pathSchema.parameters = convertOpenApiParametersToJsonSchema(
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
          operationSchema.parameters = convertOpenApiParametersToJsonSchema([
            ...pathParameters,
            ...operationSchema.parameters,
          ]);
        }
      }
    }
  }

  return schema;
}
