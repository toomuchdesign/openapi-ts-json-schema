import { fromSchema } from '@openapi-contrib/openapi-schema-to-json-schema';
import type { OpenApiSchema } from '.';

export function convertOpenApiToJsonSchema(schema: OpenApiSchema) {
  // Build a list of components dotted paths to convert
  const definitionKeywords = ['components'];
  if ('components' in schema) {
    definitionKeywords.push(
      ...Object.keys(schema.components).map((field) => `components.${field}`),
    );
  }

  return fromSchema(schema, {
    definitionKeywords,
  });
}
