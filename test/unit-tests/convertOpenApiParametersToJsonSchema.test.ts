import { describe, expect, it } from 'vitest';

import { convertOpenApiParametersToJsonSchema } from '../../src/utils/convertOpenApiPathsParameters/convertOpenApiParametersToJsonSchema';

describe('convertOpenApiParametersToJsonSchema', () => {
  describe('multiple parameters with same "in" value', () => {
    it('merges parameters into a JSON schema object', () => {
      const actual = convertOpenApiParametersToJsonSchema([
        {
          in: 'query',
          name: 'aaa',
          required: true,
          allowEmptyValue: true,
          schema: { type: 'string' },
          allowReserved: true,
        },
        {
          in: 'query',
          name: 'bbb',
          allowEmptyValue: true,
          schema: { type: 'integer' },
          allowReserved: true,
        },
        {
          in: 'header',
          name: 'zzz',
          allowEmptyValue: true,
          required: true,
          schema: { type: 'string' },
          allowReserved: true,
        },
        {
          in: 'query',
          name: 'ccc',
          required: true,
          allowEmptyValue: true,
          schema: { type: 'string' },
          allowReserved: true,
        },
      ]);

      const expected = {
        query: {
          type: 'object',
          required: ['aaa', 'ccc'],
          properties: {
            aaa: {
              type: 'string',
            },
            bbb: {
              type: 'integer',
            },
            ccc: {
              type: 'string',
            },
          },
        },
        headers: {
          type: 'object',
          required: ['zzz'],
          properties: {
            zzz: {
              type: 'string',
            },
          },
        },
      };
      expect(actual).toEqual(expected);
    });
  });

  describe('unexpected "in" values', () => {
    it("don't get included in the output", () => {
      const actual = convertOpenApiParametersToJsonSchema([
        {
          in: 'path',
          name: 'aaa',
          required: true,
          allowEmptyValue: true,
          schema: { type: 'string' },
          allowReserved: true,
        },
        {
          // @ts-expect-error specifically testing against non existing in value
          in: 'not-existing',
          name: 'bbb',
          allowEmptyValue: true,
          schema: { type: 'integer' },
          allowReserved: true,
        },
      ]);

      const expected = {
        path: {
          type: 'object',
          required: ['aaa'],
          properties: {
            aaa: {
              type: 'string',
            },
          },
        },
      };
      expect(actual).toEqual(expected);
    });
  });

  describe('duplicated parameters', () => {
    it('the latter replaces the former', () => {
      const actual = convertOpenApiParametersToJsonSchema([
        {
          in: 'path',
          name: 'aaa',
          required: true,
          allowEmptyValue: true,
          schema: { type: 'string' },
          allowReserved: true,
        },
        {
          in: 'path',
          name: 'aaa',
          schema: { type: 'integer' },
          allowReserved: true,
        },
      ]);

      const expected = {
        path: {
          type: 'object',
          required: ['aaa'],
          properties: {
            aaa: {
              type: 'integer',
            },
          },
        },
      };
      expect(actual).toEqual(expected);
    });
  });
});
