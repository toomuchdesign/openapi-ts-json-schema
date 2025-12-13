import * as openApiDocumentToJsonSchema from '@openapi-contrib/openapi-schema-to-json-schema';
import { describe, expect, it, vi } from 'vitest';

import { convertOpenApiDocumentToJsonSchema } from '../../src/utils/index.js';

const openApiDefinition = {
  type: 'string' as const,
  nullable: true,
  enum: ['yes', 'no'],
};

const jsonSchemaDefinition = {
  type: ['string', 'null'],
  enum: ['yes', 'no', null],
};

describe('convertOpenApiDocumentToJsonSchema', () => {
  describe('Nested definitions', () => {
    it('convert nested definitions', () => {
      const actual = convertOpenApiDocumentToJsonSchema({
        components: { schemas: { bar: openApiDefinition } },
      });
      const expected = {
        components: { schemas: { bar: jsonSchemaDefinition } },
      };
      expect(actual).toEqual(expected);
    });
  });

  describe('array of definitions', () => {
    it('convert nested definitions', () => {
      const actual = convertOpenApiDocumentToJsonSchema({
        components: {
          schemas: { bar: { oneOf: [openApiDefinition, openApiDefinition] } },
        },
      });
      const expected = {
        components: {
          schemas: {
            bar: { oneOf: [jsonSchemaDefinition, jsonSchemaDefinition] },
          },
        },
      };
      expect(actual).toEqual(expected);
    });
  });

  describe('Unprocessable definitions', () => {
    describe('type prop === array', () => {
      it('Returns original definition', () => {
        const definition = {
          foo: {
            type: ['string'],
          },
        };
        const actual = convertOpenApiDocumentToJsonSchema(definition);
        expect(actual).toEqual(definition);
      });
    });

    describe('parameters-like definition', () => {
      it('Returns original definition', () => {
        const definition = {
          in: 'path',
          name: 'userId',
        };
        const actual = convertOpenApiDocumentToJsonSchema(definition);
        expect(actual).toEqual(definition);
      });
    });

    describe('array of parameters-like definition', () => {
      it('Returns original definition', () => {
        const definition = {
          foo: [
            {
              in: 'path',
              name: 'foo',
            },
            {
              in: 'header',
              name: 'bar',
            },
          ],
        };
        const actual = convertOpenApiDocumentToJsonSchema(definition);
        expect(actual).toEqual(definition);
      });
    });

    describe('OpenAPi security scheme object', () => {
      it('Returns original definition', () => {
        const definition = {
          type: 'http',
          scheme: 'bearer',
        };
        const actual = convertOpenApiDocumentToJsonSchema(definition);
        expect(actual).toEqual(definition);
      });
    });

    describe('OpenAPI definition as object prop (entities converted multiple times)', () => {
      it('convert nested definitions', () => {
        const actual = convertOpenApiDocumentToJsonSchema({
          components: {
            schemas: {
              schemaName: {
                type: 'object',
                properties: {
                  two: {
                    type: 'object',
                    properties: {
                      three: {
                        type: 'string',
                        nullable: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        const expected = {
          components: {
            schemas: {
              schemaName: {
                properties: {
                  two: {
                    properties: {
                      three: {
                        type: ['string', 'null'],
                      },
                    },
                    type: 'object',
                  },
                },
                type: 'object',
              },
            },
          },
        };
        expect(actual).toEqual(expected);
      });
    });

    describe('Object with "type" prop (#211)', () => {
      it('convert object definitions', () => {
        const actual = convertOpenApiDocumentToJsonSchema({
          components: {
            schemas: {
              foo: {
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

        const expected = {
          components: {
            schemas: {
              foo: {
                type: 'object',
                properties: {
                  type: { type: ['string', 'null'] },
                  bar: { type: 'string' },
                },
                required: ['type', 'bar'],
              },
            },
          },
        };
        expect(actual).toEqual(expected);
      });
    });

    describe('on error', () => {
      it('returns human friendly error', () => {
        const spy = vi.spyOn(openApiDocumentToJsonSchema, 'fromSchema');
        spy.mockImplementationOnce(() => {
          throw new Error('Error reason');
        });

        expect(() => {
          convertOpenApiDocumentToJsonSchema({
            components: {
              schemas: {
                foo: {
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
});
