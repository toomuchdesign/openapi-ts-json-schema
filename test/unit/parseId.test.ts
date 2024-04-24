import { describe, it, expect } from 'vitest';
import { parseId } from '../../src/utils';

describe('parseId', () => {
  describe('Valid id', () => {
    it('returns, ref path', () => {
      const actual = parseId('/components/schemas/Foo');
      const expected = 'components/schemas/Foo';
      expect(actual).toBe(expected);
    });
  });

  describe('Invalid id', () => {
    it('throws error', () => {
      expect(() => parseId('#/components/schemas/Foo')).toThrow(
        new Error(
          `[openapi-ts-json-schema] Unsupported id value: "#/components/schemas/Foo"`,
        ),
      );
    });
  });
});
