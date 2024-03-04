import { describe, it, expect } from 'vitest';
import { parseRef } from '../../src/utils';

describe('parseRef', () => {
  describe('Valid ref', () => {
    it('returns, ref path', () => {
      const actual = parseRef('#/components/schemas/Foo');
      const expected = 'components/schemas/Foo';
      expect(actual).toBe(expected);
    });
  });

  describe('Invalid ref', () => {
    it('throws error', () => {
      expect(() => parseRef('/components/schemas/Foo')).toThrow(
        new Error(
          `[openapi-ts-json-schema] Unsupported ref value: "/components/schemas/Foo"`,
        ),
      );
    });
  });
});
