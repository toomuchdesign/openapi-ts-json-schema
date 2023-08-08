import traverse from 'json-schema-traverse';
import type { JSONSchema } from './';

export function patchJsonSchema(
  schema: JSONSchema,
  schemaPatcher?: (params: { schema: JSONSchema }) => void,
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
