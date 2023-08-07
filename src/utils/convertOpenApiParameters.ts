import traverse from 'json-schema-traverse';
import { convertParametersToJSONSchema } from 'openapi-jsonschema-parameters';
import type { JSONSchema } from '.';

// @NOTE @openapi-contrib/openapi-schema-to-json-schema FromParams doesn't consider required params
function convertParameters(schema: JSONSchema) {
  if ('parameters' in schema && Array.isArray(schema.parameters)) {
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
