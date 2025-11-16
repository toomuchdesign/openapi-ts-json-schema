import { describe, expect, it } from 'vitest';

import { parseId } from '../../src/utils';

describe('parseId', () => {
  describe('Valid id', () => {
    it('returns, ref path', () => {
      const actual = parseId('/components/schemas/Foo');
      const expected = {
        schemaRelativeDirName: 'components/schemas',
        schemaName: 'Foo',
      };
      expect(actual).toEqual(expected);
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
