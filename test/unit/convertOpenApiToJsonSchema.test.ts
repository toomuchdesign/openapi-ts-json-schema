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
  });
});
