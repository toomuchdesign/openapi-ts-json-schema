import type { JSONSchema4, JSONSchema6, JSONSchema7 } from 'json-schema';
export type JSONSchema = JSONSchema4 | JSONSchema6 | JSONSchema7;
export type OpenApiSchema = Record<string, any>;
export type SchemaPatcher = (params: { schema: JSONSchema }) => void;

/**
 * @prop `schemaFileName` - Valid filename for given schema (without extension). Eg: `"MySchema"`
 * @prop `schemaAbsoluteDirName` - Absolute path pointing to schema folder. Eg: `"/output/path/components/schemas"`
 * @prop `schemaAbsolutePath` - Absolute path pointing to schema file. Eg: `"/output/path/components/schemas/MySchema.ts"`
 * @prop `schemaAbsoluteImportPath` - Absolute import path (without extension). Eg: `"/output/path/components/schemas/MySchema"`
 * @prop `schemaUniqueName` - Unique JavaScript identifier used as import name. Eg: `"componentsSchemasMySchema"`
 * @prop `schemaId`
 * @prop `schema` - The actual JSON schema
 * @prop `isRef` - Mark schemas used as `$ref`
 */
export type SchemaMetaData = {
  schemaFileName: string;
  schemaAbsoluteDirName: string;
  schemaAbsolutePath: string;
  schemaAbsoluteImportPath: string;
  schemaUniqueName: string;
  schemaId: string;
  schema: JSONSchema;
  isRef: boolean;
};
export type SchemaMetaDataMap = Map<
  string, // Schema file relative path
  SchemaMetaData
>;
