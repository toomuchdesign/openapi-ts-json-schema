import traverse from 'json-schema-traverse';
import { convertParametersToJSONSchema } from 'openapi-jsonschema-parameters';
import type { JSONSchema } from '.';

/**
 * https://swagger.io/docs/specification/describing-parameters/#describing-parameters
 * @NOTE @openapi-contrib/openapi-schema-to-json-schema FromParams doesn't consider required field
 * @NOTE We are looking for parameter arrays everywhere while they are expected to be only in an "operation" or "path" definition
 * @NOTE We are converting parameters in isolation: specifications expects "path" parameters to override "operation" parameters
 */
function convertParameters(schema: JSONSchema) {
  if (
    'parameters' in schema &&
    Array.isArray(schema.parameters) &&
    'in' in schema.parameters[0]
  ) {
    schema.parameters = convertParametersToJSONSchema(schema.parameters);
    return schema;
  }
}

export function convertOpenApiParameters(schema: JSONSchema) {
  traverse(schema, {
    allKeys: true,
    cb: (schema) => {
      convertParameters(schema);
    },
  });
}
