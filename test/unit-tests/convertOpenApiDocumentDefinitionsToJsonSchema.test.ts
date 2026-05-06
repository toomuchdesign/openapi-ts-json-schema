import * as openApiDocumentToJsonSchema from '@openapi-contrib/openapi-schema-to-json-schema';
import { describe, expect, it, vi } from 'vitest';

import type { OpenApiDocument } from '../../src/types.js';
import { convertOpenApiDocumentDefinitionsToJsonSchema } from '../../src/utils/index.js';

const baseDoc: Pick<OpenApiDocument, 'openapi' | 'info'> = {
  openapi: '3.0.0' as const,
  info: { title: 'test', version: '1.0.0' },
};

// Shared OAS 3.0 schema with nullable and its expected JSON Schema equivalent
const oasSchema = {
  type: 'string' as const,
  nullable: true,
  enum: ['yes', 'no'],
};

const expectedJsonSchema = {
  type: ['string', 'null'],
  enum: ['yes', 'no', null],
};

describe('convertOpenApiDocumentDefinitionsToJsonSchema', () => {
  describe('components.schemas', () => {
    it('converts nullable schema', () => {
      const actual = convertOpenApiDocumentDefinitionsToJsonSchema({
        ...baseDoc,
        components: { schemas: { Foo: oasSchema } },
      });
      expect(actual).toEqual({
        ...baseDoc,
        components: { schemas: { Foo: expectedJsonSchema } },
      });
    });

    it('converts schemas composed with oneOf', () => {
      const actual = convertOpenApiDocumentDefinitionsToJsonSchema({
        ...baseDoc,
        components: {
          schemas: { Foo: { oneOf: [oasSchema, oasSchema] } },
        },
      });
      expect(actual).toEqual({
        ...baseDoc,
        components: {
          schemas: { Foo: { oneOf: [expectedJsonSchema, expectedJsonSchema] } },
        },
      });
    });

    it('converts deeply nested schema properties', () => {
      const actual = convertOpenApiDocumentDefinitionsToJsonSchema({
        ...baseDoc,
        components: {
          schemas: {
            Foo: {
              type: 'object',
              properties: {
                bar: {
                  type: 'object',
                  properties: {
                    baz: { type: 'string', nullable: true },
                  },
                },
              },
            },
          },
        },
      });

      expect(actual).toEqual({
        ...baseDoc,
        components: {
          schemas: {
            Foo: {
              type: 'object',
              properties: {
                bar: {
                  type: 'object',
                  properties: { baz: { type: ['string', 'null'] } },
                },
              },
            },
          },
        },
      });
    });

    it('converts schema with a property named "type" (#211)', () => {
      const actual = convertOpenApiDocumentDefinitionsToJsonSchema({
        ...baseDoc,
        components: {
          schemas: {
            Foo: {
              type: 'object',
              properties: {
                type: { type: 'string', nullable: true },
                bar: { type: 'string' },
              },
              required: ['type', 'bar'],
            },
          },
        },
      });

      expect(actual).toEqual({
        ...baseDoc,
        components: {
          schemas: {
            Foo: {
              type: 'object',
              properties: {
                type: { type: ['string', 'null'] },
                bar: { type: 'string' },
              },
              required: ['type', 'bar'],
            },
          },
        },
      });
    });
  });

  describe('definitions (OAS 2.0)', () => {
    it('converts nullable schema', () => {
      const actual = convertOpenApiDocumentDefinitionsToJsonSchema({
        ...baseDoc,
        definitions: { Foo: oasSchema },
      });

      expect(actual).toEqual({
        ...baseDoc,
        definitions: { Foo: expectedJsonSchema },
      });
    });
  });

  describe('paths', () => {
    it('converts parameter schema', () => {
      const actual = convertOpenApiDocumentDefinitionsToJsonSchema({
        ...baseDoc,
        paths: {
          '/users/{id}': {
            get: {
              parameters: [{ in: 'path', name: 'id', schema: oasSchema }],
              responses: {},
            },
          },
        },
      });

      expect(actual).toEqual({
        ...baseDoc,
        paths: {
          '/users/{id}': {
            get: {
              parameters: [
                { in: 'path', name: 'id', schema: expectedJsonSchema },
              ],
              responses: {},
            },
          },
        },
      });
    });

    it('converts requestBody content schema', () => {
      const actual = convertOpenApiDocumentDefinitionsToJsonSchema({
        ...baseDoc,
        paths: {
          '/users': {
            post: {
              requestBody: {
                content: { 'application/json': { schema: oasSchema } },
              },
              responses: {},
            },
          },
        },
      });

      expect(actual).toEqual({
        ...baseDoc,
        paths: {
          '/users': {
            post: {
              requestBody: {
                content: { 'application/json': { schema: expectedJsonSchema } },
              },
              responses: {},
            },
          },
        },
      });
    });

    it('converts response content schema', () => {
      const actual = convertOpenApiDocumentDefinitionsToJsonSchema({
        ...baseDoc,
        paths: {
          '/users': {
            get: {
              responses: {
                '200': {
                  description: 'OK',
                  content: { 'application/json': { schema: oasSchema } },
                },
              },
            },
          },
        },
      });

      expect(actual).toEqual({
        ...baseDoc,
        paths: {
          '/users': {
            get: {
              responses: {
                '200': {
                  description: 'OK',
                  content: {
                    'application/json': { schema: expectedJsonSchema },
                  },
                },
              },
            },
          },
        },
      });
    });
  });

  describe('components (schema key)', () => {
    it('converts components.responses content schema', () => {
      const actual = convertOpenApiDocumentDefinitionsToJsonSchema({
        ...baseDoc,
        components: {
          responses: {
            MyResponse: {
              description: 'My response',
              content: { 'application/json': { schema: oasSchema } },
            },
          },
        },
      });

      expect(actual).toEqual({
        ...baseDoc,
        components: {
          responses: {
            MyResponse: {
              description: 'My response',
              content: { 'application/json': { schema: expectedJsonSchema } },
            },
          },
        },
      });
    });

    it('converts components.requestBodies content schema', () => {
      const actual = convertOpenApiDocumentDefinitionsToJsonSchema({
        ...baseDoc,
        components: {
          requestBodies: {
            MyBody: {
              content: { 'application/json': { schema: oasSchema } },
            },
          },
        },
      });

      expect(actual).toEqual({
        ...baseDoc,
        components: {
          requestBodies: {
            MyBody: {
              content: { 'application/json': { schema: expectedJsonSchema } },
            },
          },
        },
      });
    });

    it('converts components.headers schema', () => {
      const actual = convertOpenApiDocumentDefinitionsToJsonSchema({
        ...baseDoc,
        components: {
          headers: { MyHeader: { schema: oasSchema } },
        },
      });

      expect(actual).toEqual({
        ...baseDoc,
        components: { headers: { MyHeader: { schema: expectedJsonSchema } } },
      });
    });

    it('converts components.parameters schema', () => {
      const actual = convertOpenApiDocumentDefinitionsToJsonSchema({
        ...baseDoc,
        components: {
          parameters: {
            MyParam: { in: 'query', name: 'foo', schema: oasSchema },
          },
        },
      });

      expect(actual).toEqual({
        ...baseDoc,
        components: {
          parameters: {
            MyParam: { in: 'query', name: 'foo', schema: expectedJsonSchema },
          },
        },
      });
    });
  });

  describe('non-schema areas', () => {
    it('preserves operation-level deprecated flag', () => {
      const actual = convertOpenApiDocumentDefinitionsToJsonSchema({
        ...baseDoc,
        paths: {
          '/users': { get: { deprecated: true, responses: {} } },
        },
      });

      expect(actual).toEqual({
        ...baseDoc,
        paths: { '/users': { get: { deprecated: true, responses: {} } } },
      });
    });
  });

  describe('OAS 3.1', () => {
    it('skips conversion for openapi 3.1.x documents', () => {
      const input: OpenApiDocument = {
        openapi: '3.1.0' as const,
        info: { title: 'test', version: '1.0.0' },
        components: {
          schemas: { Foo: { type: 'string' as const, nullable: true } },
        },
      };

      const actual = convertOpenApiDocumentDefinitionsToJsonSchema(input);
      expect(actual).toEqual(input);
    });
  });

  describe('error handling', () => {
    it('throws human friendly error on conversion failure', () => {
      const spy = vi.spyOn(openApiDocumentToJsonSchema, 'fromSchema');
      spy.mockImplementationOnce(() => {
        throw new Error('Error reason');
      });

      expect(() => {
        convertOpenApiDocumentDefinitionsToJsonSchema({
          ...baseDoc,
          components: {
            schemas: {
              Foo: {
                type: 'object',
                properties: {
                  // @ts-expect-error Deliberately testing invalid definition types
                  bar: { type: 'invalid-type' },
                },
              },
            },
          },
        });
      }).toThrow(
        '[openapi-ts-json-schema] OpenApi to JSON schema conversion failed: "Error reason"',
      );
    });
  });
});
