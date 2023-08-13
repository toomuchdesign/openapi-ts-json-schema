import { convertParametersToJSONSchema } from 'openapi-jsonschema-parameters';
import type { JSONSchema } from '.';

/**
 * Parameters field can only be found in:
 * - paths[path].parameters
 * - paths[path][operation].parameters
 *
 * https://swagger.io/docs/specification/describing-parameters/
 */
export function convertOpenApiParameters(schema: JSONSchema) {
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
