/** Symbol key used to store a schema's internal path-based ID on schema objects */
export const SCHEMA_ID_SYMBOL = Symbol('id');

/** Symbol key used to attach a leading line-comment string to a node */
export const LEADING_COMMENT_SYMBOL = Symbol('leading-comment');

/** JSON Pointer prefix for OpenAPI component schemas, used to detect and resolve $refs */
export const OPEN_API_COMPONENTS_SCHEMAS_PATH = '/components/schemas/';
