export { patchJsonSchemaDefinitions } from './patchJsonSchemaDefinitions.js';
export { makeTsJsonSchema } from './makeTsJsonSchema/index.js';
export { convertOpenApiPathsParameters } from './convertOpenApiPathsParameters/index.js';
export { convertOpenApiDocumentDefinitionsToJsonSchema } from './convertOpenApiDocumentDefinitionsToJsonSchema.js';
export { convertOpenApiParameterToJsonSchema } from './convertOpenApiParameterToJsonSchema.js';
export { makeSchemaFileContents } from './makeSchemaFileContents.js';
export { parseId } from './parseId.js';
export { refToId } from './refToId.js';
export { makeId } from './makeId.js';
export {
  SCHEMA_ID_SYMBOL,
  PLACEHOLDER_REGEX,
  idToPlaceholder,
} from './refReplacementUtils.js';

export { replaceInlinedRefsWithStringPlaceholder } from './makeTsJsonSchema/replaceInlinedRefsWithStringPlaceholder.js';
export { replacePlaceholdersWithImportedSchemas } from './makeTsJsonSchema/replacePlaceholdersWithImportedSchemas.js';
export { addSchemaToMetaData } from './addSchemaToMetaData.js';
export { isObject } from './isObject.js';
export { filenamify } from './filenamify.js';
export { isOpenApiParameterObject } from './isOpenApiParameterObject.js';
export { parseSingleItemPath } from './parseSingleItemPath.js';

export { clearFolder } from './clearFolder.js';
export { makeRelativeImportPath } from './makeRelativeImportPath.js';
export { formatTypeScript } from './formatTypeScript.js';
export { saveFile } from './saveFile.js';
export { saveSchemaFiles } from './saveSchemaFiles.js';
