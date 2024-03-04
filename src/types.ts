import type { JSONSchema4, JSONSchema6, JSONSchema7 } from 'json-schema';
export type JSONSchema = JSONSchema4 | JSONSchema6 | JSONSchema7;
export type JSONSchemaWithPlaceholders = JSONSchema | string;
export type OpenApiSchema = Record<string, any>;
export type SchemaPatcher = (params: { schema: JSONSchema }) => void;
import type {
  makeRelativeModulePath,
  formatTypeScript,
  saveFile,
} from './utils';

/**
 * @prop `schemaAbsoluteDirName` - Absolute path pointing to schema folder. Eg: `"/output/path/components/schemas"`
 * @prop `schemaAbsolutePath` - Absolute path pointing to schema file. Eg: `"/output/path/components/schemas/MySchema.ts"`
 * @prop `schemaAbsoluteImportPath` - Absolute import path (without extension). Eg: `"/output/path/components/schemas/MySchema"`
 * @prop `schemaUniqueName` - Unique JavaScript identifier used as import name. Eg: `"componentsSchemasMySchema"`
 * @prop `schemaId` - JSON schema Compound Schema Document `$id`. Eg `"/components/schemas/MySchema"`
 * @prop `originalSchema` - Original dereferenced JSON schema
 * @prop `isRef` - True if schemas is used as `$ref`
 */
export type SchemaMetaData = {
  schemaAbsoluteDirName: string;
  schemaAbsolutePath: string;
  schemaAbsoluteImportPath: string;
  schemaUniqueName: string;
  schemaId: string;
  originalSchema: JSONSchema;
  isRef: boolean;
};

export type SchemaMetaDataMap = Map<
  string, // Schema file relative path
  SchemaMetaData
>;

export type ReturnPayload = {
  outputPath: string;
  metaData: { schemas: SchemaMetaDataMap };
};

type PluginInput = ReturnPayload & {
  utils: {
    makeRelativeModulePath: typeof makeRelativeModulePath;
    formatTypeScript: typeof formatTypeScript;
    saveFile: typeof saveFile;
  };
};

export type Plugin<Options = void> = (
  options: Options,
) => (input: PluginInput) => Promise<void>;
