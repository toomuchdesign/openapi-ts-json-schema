import traverse from 'json-schema-traverse';
import type { JSONSchema, SchemaPatcher } from './';

export function patchJsonSchema(
  schema: JSONSchema,
  schemaPatcher?: SchemaPatcher,
): JSONSchema {
  if (schema && schemaPatcher) {
    traverse(schema, {
      allKeys: true,
      cb: (schema) => {
        schemaPatcher({ schema });
      },
    });
  }

  return schema;
}
