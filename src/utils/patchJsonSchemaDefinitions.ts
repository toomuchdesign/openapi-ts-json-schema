import traverse, { type SchemaObject } from 'json-schema-traverse';

import type { SchemaPatcher } from '../types.js';

/**
 * Patch generated schemas with a user-provided patch function
 */
export function patchJsonSchemaDefinitions<Schema extends SchemaObject>(
  schema: Schema,
  schemaPatcher?: SchemaPatcher,
): Schema {
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
