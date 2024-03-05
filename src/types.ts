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
 * Meta data for representing a specific openApi definition
 * @property `schemaId` - JSON schema Compound Schema Document `$id`. Eg `"/components/schemas/MySchema"`
 * @property `isRef` - True if schemas is used as `$ref`
 * @property `schemaUniqueName` - Unique JavaScript identifier used as import name. Eg: `"componentsSchemasMySchema"`
 * @property `originalSchema` - Original dereferenced JSON schema
 *
 * @property `schemaAbsoluteDirName` - Absolute path pointing to schema folder (posix or win32). Eg: `"Users/username/output/path/components/schemas"`
 * @property `schemaAbsolutePath` - Absolute path pointing to schema file (posix or win32). Eg: `"Users/username/output/path/components/schemas/MySchema.ts"`
 * @property `schemaAbsoluteImportPath` - Absolute import path (posix or win32, without extension). Eg: `"Users/username/output/path/components/schemas/MySchema"`
 */
export type SchemaMetaData = {
  schemaId: string;
  isRef: boolean;
  schemaUniqueName: string;
  originalSchema: JSONSchema;

  schemaAbsoluteDirName: string;
  schemaAbsolutePath: string;
  schemaAbsoluteImportPath: string;
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
