import { fromSchema } from '@openapi-contrib/openapi-schema-to-json-schema';
import type { OpenAPIObject as OpenAPIObject_v3_0 } from 'openapi3-ts/oas30';
import type { OpenAPIObject as OpenAPIObject_v3_1 } from 'openapi3-ts/oas31';

import type { JSONSchema, OpenApiDocument } from '../types.js';
import { isObject } from './index.js';

/**
 * Structural type for the document fields this module needs to access.
 * OpenApiDocument omits `openapi` (and doesn't cover v2 `definitions`), so a
 * single cast to this type at the function boundary avoids scattering
 * intermediate `as` assertions throughout the implementation.
 *
 * @TODO make this OpenApiDocument definition
 */
type DocumentLike = (OpenAPIObject_v3_0 | OpenAPIObject_v3_1) &
  // OpenAPI v2 support: definitions are top-level, not under components
  {
    definitions?: Record<string, unknown>;
  };

function convertSchema<Value extends unknown>(
  value: Value,
): JSONSchema | Value {
  if (!isObject(value)) {
    return value;
  }

  try {
    const schema = fromSchema(value, { strictMode: false });
    // $schema is appended by @openapi-contrib/openapi-schema-to-json-schema
    delete schema.$schema;
    return schema;
  } catch (error) {
    /* v8 ignore next 1 */
    const errorMessage = error instanceof Error ? error.message : '';
    throw new Error(
      `[openapi-ts-json-schema] OpenApi to JSON schema conversion failed: "${errorMessage}"`,
      { cause: value },
    );
  }
}

/**
 * Recursively walk a document node, converting any value found under a
 * `schema` key with fromSchema.
 *
 * This covers all OAS 3.0 locations where Schema Objects appear under a
 * literal `schema` key: parameter schemas, request-body content schemas,
 * response content schemas, header schemas, and callback schemas.
 *
 * We stop recursing once we reach a `schema` key because fromSchema already
 * recurses into the schema tree (properties, allOf, …) internally — descending
 * further would double-convert nested schemas.
 */
function walkAndConvertDefinitionKeys(node: unknown): void {
  if (Array.isArray(node)) {
    for (const item of node) {
      walkAndConvertDefinitionKeys(item);
    }
    return;
  }

  if (isObject(node)) {
    for (const key of Object.keys(node)) {
      if (key === 'schema' && isObject(node[key])) {
        node[key] = convertSchema(node[key]);
        // Do not recurse: fromSchema handles the full schema tree
      } else {
        walkAndConvertDefinitionKeys(node[key]);
      }
    }
  }
}

/**
 * Convert OpenAPI schema objects to JSON Schema in-place on a cloned document.
 *
 * Rather than visiting every node in the document (the previous brute-force
 * approach), we convert only the locations the OAS spec defines as Schema
 * Objects:
 *
 *   1. components.schemas[*] / definitions[*] — converted directly, since
 *      these are top-level schema objects not nested under a `schema` key.
 *
 *   2. Any value under a literal `schema` key elsewhere in the document
 *      (parameter schemas, requestBody content schemas, response content
 *      schemas, header schemas, callback schemas) — covered by
 *      walkAndConvertDefinitionKeys.
 *
 * fromSchema recurses into sub-schemas (properties, allOf, anyOf, …)
 * internally, so it only needs to be called once per top-level schema entry.
 *
 * OpenAPI 3.1+ schemas are already valid JSON Schema (Draft 2020-12) and
 * require no conversion.
 */
export function convertOpenApiDocumentDefinitionsToJsonSchema(
  doc: OpenApiDocument,
): OpenApiDocument {
  // OpenApiDocument omits `openapi` and doesn't cover v2 `definitions`;
  // one cast here keeps the rest of the function free of type assertions.
  const docTyped = doc as unknown as DocumentLike;

  // OAS 3.1+ is already valid JSON Schema — skip conversion entirely
  if (docTyped.openapi?.startsWith('3.1')) {
    return doc;
  }

  const result = structuredClone(docTyped);

  // 1. Direct schema containers:
  //    - OAS 3.0: components.schemas[*]
  //    - OAS 2.0: definitions[*]
  for (const container of [result.components?.schemas, result.definitions]) {
    if (!container) continue;
    for (const [name, schema] of Object.entries(container)) {
      container[name] = convertSchema(schema);
    }
  }

  // 2. Schema Objects under `schema` keys throughout the document.
  //    Covers parameters, requestBodies, responses, headers, callbacks in
  //    both paths and components.
  walkAndConvertDefinitionKeys(result.paths);
  walkAndConvertDefinitionKeys(result.components?.responses);
  walkAndConvertDefinitionKeys(result.components?.requestBodies);
  walkAndConvertDefinitionKeys(result.components?.headers);
  walkAndConvertDefinitionKeys(result.components?.parameters);
  walkAndConvertDefinitionKeys(result.components?.callbacks);

  return result as unknown as OpenApiDocument;
}
