import { fromSchema } from '@openapi-contrib/openapi-schema-to-json-schema';
import type { OpenApiSchema } from '../types';

export function convertOpenApiToJsonSchema(schema: OpenApiSchema) {
  /**
   * @openapi-contrib/openapi-schema-to-json-schema doesn't convert definitions by default,
   * Here we convert all direct children of components
   * https://swagger.io/specification/#components-object
   * https://github.com/openapi-contrib/openapi-schema-to-json-schema#definitionkeywords-array
   */
  const definitionKeywords = ['components'];

  /* istanbul ignore else: this if condition is executed and tested -- @preserve */
  if ('components' in schema) {
    definitionKeywords.push(
      ...Object.keys(schema.components).map((field) => `components.${field}`),
    );
  }

  const jsonSchema = fromSchema(schema, {
    definitionKeywords,
  });

  return jsonSchema;
}
