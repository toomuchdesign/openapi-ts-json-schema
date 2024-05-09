import { fromParameter } from '@openapi-contrib/openapi-schema-to-json-schema';
import type { JSONSchema } from '../types';

export function convertOpenApiParameterToJsonSchema(parameter: JSONSchema) {
  const schema = fromParameter(parameter, { strictMode: false });
  // $schema is appended by @openapi-contrib/openapi-schema-to-json-schema
  delete schema.$schema;
  return schema;
}
