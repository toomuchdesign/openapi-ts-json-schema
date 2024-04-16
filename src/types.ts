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

export type Options = {
  openApiSchema: string;
  definitionPathsToGenerateFrom: string[];
  schemaPatcher?: SchemaPatcher;
  outputPath?: string;
  plugins?: ReturnType<Plugin>[];
  silent?: boolean;
  refHandling?: 'inline' | 'import' | 'keep';
};

/**
 * Meta data for representing a specific openApi definition
 * @property `id` - JSON schema Compound Schema Document `$id`. Eg `"/components/schemas/MySchema"`
 * @property `isRef` - True if schemas is used as `$ref`
 * @property `uniqueName` - Unique JavaScript identifier used as import name. Eg: `"componentsSchemasMySchema"`
 * @property `originalSchema` - Original dereferenced JSON schema
 *
 * @property `absoluteDirName` - Absolute path pointing to schema folder (posix or win32). Eg: `"Users/username/output/path/components/schemas"`
 * @property `absolutePath` - Absolute path pointing to schema file (posix or win32). Eg: `"Users/username/output/path/components/schemas/MySchema.ts"`
 * @property `absoluteImportPath` - Absolute import path (posix or win32, without extension). Eg: `"Users/username/output/path/components/schemas/MySchema"`
 */
export type SchemaMetaData = {
  id: string;
  isRef: boolean;
  uniqueName: string;
  originalSchema: JSONSchema;

  absoluteDirName: string;
  absolutePath: string;
  absoluteImportPath: string;
};

export type SchemaMetaDataMap = Map<
  string, // Schema file relative path
  SchemaMetaData
>;

export type ReturnPayload = {
  outputPath: string;
  metaData: { schemas: SchemaMetaDataMap };
};

type OnInitInput = {
  options: Options;
};

type OnBeforeGenerationInput = ReturnPayload & {
  options: Options;
  utils: {
    makeRelativeModulePath: typeof makeRelativeModulePath;
    formatTypeScript: typeof formatTypeScript;
    saveFile: typeof saveFile;
  };
};

export type Plugin<PluginOptions = void> = (options: PluginOptions) => {
  onInit?: (input: OnInitInput) => Promise<void>;
  onBeforeGeneration?: (input: OnBeforeGenerationInput) => Promise<void>;
};
