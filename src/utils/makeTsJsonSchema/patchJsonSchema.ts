import traverse from 'json-schema-traverse';

import type { JSONSchema, SchemaPatcher } from '../../types';

/**
 * Patch generated schemas with a user-provided patch function
 */
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
