import { describe, it, expect } from 'vitest';
import { convertOpenApiToJsonSchema } from '../../src/utils';

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
  });
});
