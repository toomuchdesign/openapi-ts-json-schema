import { describe, expect, it } from 'vitest';

import { makeUniqueName } from '../../src/utils/index.js';

describe('makeUniqueName', () => {
  describe('camelCases path-like IDs', () => {
    it.each([
      ['/components/schemas/Answer', 'componentsSchemasAnswer'],
      ['/components/schemas/my-schema', 'componentsSchemasMySchema'],
    ])('makeUniqueName("%s") === "%s"', (input, expected) => {
      expect(makeUniqueName(input)).toBe(expected);
    });
  });

  describe('camelCases hyphenated names', () => {
    it.each([
      ['my-schema', 'mySchema'],
      ['some-long-name', 'someLongName'],
    ])('makeUniqueName("%s") === "%s"', (input, expected) => {
      expect(makeUniqueName(input)).toBe(expected);
    });
  });

  describe('prefixes _ to JS reserved words', () => {
    it.each([
      ['class', '_class'],
      ['return', '_return'],
      ['type', 'type'],
    ])('makeUniqueName("%s") === "%s"', (input, expected) => {
      expect(makeUniqueName(input)).toBe(expected);
    });
  });

  describe('prefixes _ when namify output is digit-leading', () => {
    it.each([
      ['123', '_123'],
      ['1st', '_1st'],
    ])('makeUniqueName("%s") === "%s"', (input, expected) => {
      expect(makeUniqueName(input)).toBe(expected);
    });
  });
});
