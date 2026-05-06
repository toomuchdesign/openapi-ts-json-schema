/** Symbol key used to store a schema's internal path-based ID on schema objects */
export const SCHEMA_ID_SYMBOL = Symbol('id');

/** Delimiter marking the start of an inlined schema ID placeholder in stringified output */
export const SCHEMA_ID_MARKER_START = '_OTJS-START_';
/** Delimiter marking the end of an inlined schema ID placeholder in stringified output */
export const SCHEMA_ID_MARKER_END = '_OTJS-END_';

/** Symbol used by comment-json to attach leading comments to a node */
export const COMMENT_JSON_BEFORE_SYMBOL = Symbol.for('before');

/** JSON Pointer prefix for OpenAPI component schemas, used to detect and resolve $refs */
export const OPEN_API_COMPONENTS_SCHEMAS_PATH = '/components/schemas/';
