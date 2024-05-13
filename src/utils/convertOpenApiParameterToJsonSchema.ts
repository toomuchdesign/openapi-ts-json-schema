import { fromParameter } from '@openapi-contrib/openapi-schema-to-json-schema';
import type { JSONSchema, OpenApiParameter } from '../types';

/**
 * Convert one single OpenAPI parameter to JSON schema
 */
export function convertOpenApiParameterToJsonSchema(
  parameter: OpenApiParameter,
): JSONSchema {
  // @ts-expect-error openapi3-ts types seem to conflict with @openapi-contrib/openapi-schema-to-json-schema ones
  const schema = fromParameter(parameter, { strictMode: false });
  // $schema is appended by @openapi-contrib/openapi-schema-to-json-schema
  delete schema.$schema;
  return schema;
}
