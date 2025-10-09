import type { JSONSchema4, JSONSchema6, JSONSchema7 } from 'json-schema';
import type {
  PathItemObject as PathItemObject_v3_0,
  SchemaObject as SchemaObject_v3_0,
  ParameterObject as ParameterObject_v3_0,
  ReferenceObject as ReferenceObject_v3_0,
  OpenAPIObject as OpenAPIObject_v3_0,
} from 'openapi3-ts/oas30';
import type {
  PathItemObject as PathItemObject_v3_1,
  SchemaObject as SchemaObject_v3_1,
  ParameterObject as ParameterObject_v3_1,
  ReferenceObject as ReferenceObject_v3_1,
  OpenAPIObject as OpenAPIObject_v3_1,
} from 'openapi3-ts/oas31';

export type OpenApiDocument = Omit<
  OpenAPIObject_v3_0 | OpenAPIObject_v3_1,
  'openapi' | 'info'
>;

// This type should represent any generated OpenAPI
type OpenApiObject_v3_0 =
  | PathItemObject_v3_0
  | SchemaObject_v3_0
  | ParameterObject_v3_0
  | ReferenceObject_v3_0;
type OpenApiObject_v3_1 =
  | PathItemObject_v3_1
  | SchemaObject_v3_1
  | ParameterObject_v3_1
  | ReferenceObject_v3_1;
export type OpenApiObject = OpenApiObject_v3_0 | OpenApiObject_v3_1;

type OpenApiParameter_v3_0 = ParameterObject_v3_0 | ReferenceObject_v3_0;
type OpenApiParameter_v3_1 = ParameterObject_v3_1 | ReferenceObject_v3_1;
export type OpenApiParameter = OpenApiParameter_v3_0 | OpenApiParameter_v3_1;

export type JSONSchema = JSONSchema4 | JSONSchema6 | JSONSchema7;
export type JSONSchemaWithPlaceholders = JSONSchema | string;

export type SchemaPatcher = (params: { schema: JSONSchema }) => void;
export type RefHandling = 'import' | 'inline' | 'keep';
export type IdMapper = (input: { id: string }) => string;

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
  refHandling?: RefHandling;
  idMapper?: IdMapper;
};

/**
 * Meta data for representing a specific openApi definition
 * @property `id` - Internal unique schema identifier. Eg `"/components/schemas/MySchema"`
 * @property `$id` - JSON schema Compound Schema Document `$id`. Eg `"/components/schemas/MySchema"`
 * @property `isRef` - True if schemas is used as `$ref`
 * @property `shouldBeGenerated` - True is the schema has to be generated
 * @property `uniqueName` - Unique JavaScript identifier used as import name. Eg: `"componentsSchemasMySchema"`
 * @property `openApiDefinition` - Original dereferenced openAPI definition
 * @property `originalSchema` - Original dereferenced JSON schema
 * @property `fileContent` - Text content of schema file
 *
 * @property `absoluteDirName` - Absolute path pointing to schema folder (posix or win32). Eg: `"Users/username/output/path/components/schemas"`
 * @property `absolutePath` - Absolute path pointing to schema file (posix or win32). Eg: `"Users/username/output/path/components/schemas/MySchema.ts"`
 * @property `absoluteImportPath` - Absolute import path (posix or win32, without extension). Eg: `"Users/username/output/path/components/schemas/MySchema"`
 */
export type SchemaMetaData = {
  id: string;
  $id: string;
  isRef: boolean;
  shouldBeGenerated: boolean;
  uniqueName: string;
  openApiDefinition?: OpenApiObject;
  originalSchema: JSONSchema;
  fileContent?: string;

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
