import { existsSync } from 'fs';
import path from 'node:path';
import $RefParser from '@apidevtools/json-schema-ref-parser';
import get from 'lodash.get';
import {
  clearFolder,
  makeTsJsonSchemaFiles,
  SCHEMA_ID_SYMBOL,
  convertOpenApiDocumentToJsonSchema,
  convertOpenApiPathsParameters,
  addSchemaToMetaData,
  makeId,
  formatTypeScript,
  saveFile,
  makeRelativeModulePath,
  refToId,
} from './utils';
import type {
  SchemaMetaDataMap,
  OpenApiObject,
  OpenApiDocument,
  JSONSchema,
  ReturnPayload,
  Options,
} from './types';

export async function openapiToTsJsonSchema(
  options: Options,
): Promise<ReturnPayload> {
  const { plugins = [] } = options;

  // Execute plugins onInit method
  for (const { onInit } of plugins) {
    if (onInit) {
      await onInit({
        options,
      });
    }
  }

  const {
    openApiSchema: openApiSchemaRelative,
    definitionPathsToGenerateFrom,
    schemaPatcher,
    outputPath: providedOutputPath,
    silent,
    refHandling = 'import',
    $idMapper = ({ id }) => id,
  } = options;

  if (definitionPathsToGenerateFrom.length === 0 && !silent) {
    console.log(
      `[openapi-ts-json-schema] ⚠️ No schemas will be generated since definitionPathsToGenerateFrom option is empty`,
    );
  }

  definitionPathsToGenerateFrom.forEach((defPath) => {
    if (path.isAbsolute(defPath)) {
      throw new Error(
        `[openapi-ts-json-schema] "definitionPathsToGenerateFrom" must be an array of relative paths. "${defPath}" found.`,
      );
    }
  });

  const openApiSchemaPath = path.resolve(openApiSchemaRelative);
  if (!existsSync(openApiSchemaPath)) {
    throw new Error(
      `[openapi-ts-json-schema] Provided OpenAPI definition path doesn't exist: ${openApiSchemaPath}`,
    );
  }

  const outputPath =
    providedOutputPath ??
    path.resolve(path.dirname(openApiSchemaPath), 'schemas-autogenerated');

  await clearFolder(outputPath);

  const openApiParser = new $RefParser();
  const jsonSchemaParser = new $RefParser();

  // Resolve and inline external $ref definitions
  // @ts-expect-error @apidevtools/json-schema-ref-parser types supports JSON schemas only
  const bundledOpenApiSchema: OpenApiDocument =
    await openApiParser.bundle(openApiSchemaPath);

  // Convert oas definitions to JSON schema (excluding paths and parameter objects)
  const initialJsonSchema =
    convertOpenApiDocumentToJsonSchema(bundledOpenApiSchema);

  const inlinedRefs: Map<
    string,
    { openApiDefinition: OpenApiObject; jsonSchema: JSONSchema }
  > = new Map();

  // Inline and collect internal $ref definitions
  // @ts-expect-error @apidevtools/json-schema-ref-parser types supports JSON schemas only
  const dereferencedJsonSchema: OpenApiDocument =
    await jsonSchemaParser.dereference(initialJsonSchema, {
      dereference: {
        // @ts-expect-error onDereference seems not to be properly typed
        onDereference: (ref, inlinedSchema) => {
          const id = refToId(ref);

          // Keep track of inlined refs
          if (!inlinedRefs.has(id)) {
            // Shallow copy the ref schema to avoid the mutations below
            inlinedRefs.set(id, {
              // @ts-expect-error Spread types may only be created from object types
              openApiDefinition: openApiParser.$refs.get(ref),
              jsonSchema: {
                // @ts-expect-error Spread types may only be created from object types
                ...jsonSchemaParser.$refs.get(ref),
              },
            });
          }

          /**
           * mark inlined ref objects with a "SCHEMA_ID_SYMBOL"
           * to retrieve their id once inlined
           */
          inlinedSchema[SCHEMA_ID_SYMBOL] = id;

          /**
           * "inline" refHandling support:
           * add a $ref comment to each inlined schema with the original ref value.
           * See: https://github.com/kaelzhang/node-comment-json
           */
          if (refHandling === 'inline') {
            inlinedSchema[Symbol.for('before')] = [
              {
                type: 'LineComment',
                value: ` $ref: "${ref}"`,
              },
            ];
          }
        },
      },
    });

  const jsonSchema = convertOpenApiPathsParameters(dereferencedJsonSchema);
  const schemaMetaDataMap: SchemaMetaDataMap = new Map();

  /**
   * Create meta data for each output schema
   */
  for (const definitionPath of definitionPathsToGenerateFrom) {
    const jsonSchemaDefinitions = get(jsonSchema, definitionPath);
    const openApiDefinitions = get(bundledOpenApiSchema, definitionPath);

    for (const schemaName in jsonSchemaDefinitions) {
      const id = makeId({
        schemaRelativeDirName: definitionPath,
        schemaName,
      });

      addSchemaToMetaData({
        id,
        $id: $idMapper({ id }),
        schemaMetaDataMap,
        openApiDefinition: openApiDefinitions[schemaName],
        jsonSchema: jsonSchemaDefinitions[schemaName],
        outputPath,
        isRef: inlinedRefs.has(id),
        shouldBeGenerated: true,
      });
    }
  }

  /**
   * Create meta data for each $ref schemas which have been previously dereferenced.
   */
  for (const [id, { openApiDefinition, jsonSchema }] of inlinedRefs) {
    /**
     * In "inline" mode $ref schemas not explicitly marked for generation
     * should not be generated
     *
     * All the other "refHandling" modes generate all $ref schemas
     */
    let shouldBeGenerated = true;
    if (refHandling === 'inline' && !schemaMetaDataMap.has(id)) {
      shouldBeGenerated = false;
    }

    addSchemaToMetaData({
      id,
      $id: $idMapper({ id }),
      schemaMetaDataMap,
      openApiDefinition,
      jsonSchema,
      outputPath,
      isRef: true,
      shouldBeGenerated,
    });
  }

  const returnPayload: ReturnPayload = {
    outputPath,
    metaData: { schemas: schemaMetaDataMap },
  };

  // Execute plugins onBeforeGeneration method
  for (const { onBeforeGeneration } of plugins) {
    if (onBeforeGeneration) {
      await onBeforeGeneration({
        ...returnPayload,
        options,
        utils: { makeRelativeModulePath, formatTypeScript, saveFile },
      });
    }
  }

  // Generate schemas
  await makeTsJsonSchemaFiles({
    refHandling,
    schemaMetaDataMap,
    schemaPatcher,
    $idMapper,
  });

  if (!silent) {
    console.log(
      `[openapi-ts-json-schema] ✅ JSON schema models generated at ${outputPath}`,
    );
  }

  return returnPayload;
}
