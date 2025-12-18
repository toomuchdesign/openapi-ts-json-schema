import { describe, expect, it } from 'vitest';

import { refToId } from '../../src/utils/index.js';

describe('refToId', () => {
  describe('Valid ref', () => {
    it('returns, ref path', () => {
      const actual = refToId('#/components/schemas/Foo');
      const expected = '/components/schemas/Foo';
      expect(actual).toBe(expected);
    });
  });

  describe('Invalid ref', () => {
    it('throws error', () => {
      expect(() => refToId('/components/schemas/Foo')).toThrow(
        new Error(
          `[openapi-ts-json-schema] Unsupported ref value: "/components/schemas/Foo"`,
        ),
      );
    });
  });
});
