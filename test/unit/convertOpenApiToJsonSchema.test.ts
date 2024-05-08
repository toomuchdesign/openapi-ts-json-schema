import { describe, it, expect, vi } from 'vitest';
import { convertOpenApiToJsonSchema } from '../../src/utils';
import * as openapiSchemaToJsonSchema from '@openapi-contrib/openapi-schema-to-json-schema';

const openApiDefinition = {
  type: 'string',
  nullable: true,
  enum: ['yes', 'no'],
};

const jsonSchemaDefinition = {
  type: ['string', 'null'],
  enum: ['yes', 'no', null],
};

describe('convertOpenApiToJsonSchema', () => {
  describe('Nested definitions', () => {
    it('convert nested definitions', () => {
      const actual = convertOpenApiToJsonSchema({
        foo: { bar: openApiDefinition },
      });
      const expected = {
        foo: { bar: jsonSchemaDefinition },
      };
      expect(actual).toEqual(expected);
    });
  });

  describe('array of definitions', () => {
    it('convert nested definitions', () => {
      const actual = convertOpenApiToJsonSchema({
        foo: { schema: { oneOf: [openApiDefinition, openApiDefinition] } },
      });

      const expected = {
        foo: {
          schema: { oneOf: [jsonSchemaDefinition, jsonSchemaDefinition] },
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
        const actual = convertOpenApiToJsonSchema(definition);
        expect(actual).toEqual(definition);
      });
    });

    describe('parameters-like definition', () => {
      it('Returns original definition', () => {
        const definition = {
          in: 'path',
          name: 'userId',
        };
        const actual = convertOpenApiToJsonSchema(definition);
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
        const actual = convertOpenApiToJsonSchema(definition);
        expect(actual).toEqual(definition);
      });
    });

    describe('OpenAPi security scheme object', () => {
      it('Returns original definition', () => {
        const definition = {
          type: 'http',
          scheme: 'bearer',
        };
        const actual = convertOpenApiToJsonSchema(definition);
        expect(actual).toEqual(definition);
      });
    });

    describe('Object with "type" prop (#211)', () => {
      it('convert object definitions', () => {
        const actual = convertOpenApiToJsonSchema({
          type: 'object',
          properties: {
            type: { type: 'string', nullable: true },
            bar: { type: 'string' },
          },
          required: ['type', 'bar'],
        });

        const expected = {
          type: 'object',
          properties: {
            type: { type: ['string', 'null'] },
            bar: { type: 'string' },
          },
          required: ['type', 'bar'],
        };

        expect(actual).toEqual(expected);
      });
    });

    describe('on error', () => {
      it('returns human friendly error', () => {
        const spy = vi.spyOn(openapiSchemaToJsonSchema, 'fromSchema');
        spy.mockImplementationOnce(() => {
          throw new Error('Error reason');
        });

        expect(() => {
          convertOpenApiToJsonSchema({
            type: 'object',
            properties: {
              bar: { type: 'invalid-type' },
            },
          });
        }).toThrowError(
          '[openapi-ts-json-schema] OpenApi to JSON schema conversion failed: "Error reason"',
        );
      });
    });
  });
});
