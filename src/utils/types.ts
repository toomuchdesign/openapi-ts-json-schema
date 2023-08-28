import type { JSONSchema4, JSONSchema6, JSONSchema7 } from 'json-schema';
export type JSONSchema = JSONSchema4 | JSONSchema6 | JSONSchema7;
export type OpenApiSchema = Record<string, any>;
export type SchemaPatcher = (params: { schema: JSONSchema }) => void;
export type SchemaRecord = Map<
  string,
  {
    schemaName: string;
    schemaAbsolutePath: string;
    schema: JSONSchema;
  }
>;
