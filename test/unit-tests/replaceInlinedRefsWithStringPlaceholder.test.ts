import { describe, expect, it } from 'vitest';

import {
  SCHEMA_ID_SYMBOL,
  replaceInlinedRefsWithStringPlaceholder,
} from '../../src/utils/index.js';

describe('replaceInlinedRefsWithStringPlaceholder', () => {
  describe('nested object market with SCHEMA_ID_SYMBOL', () => {
    it('replaces objects with expected string placeholder', () => {
      const actual = replaceInlinedRefsWithStringPlaceholder({
        schemas: {
          object: {
            foo: 'bar',
            [SCHEMA_ID_SYMBOL]: '/ref/in/object',
          },
          array: [
            'foo',
            { hello: 'world', [SCHEMA_ID_SYMBOL]: '/ref/in/array' },
            'bar',
          ],
        },
      });

      const expected = {
        schemas: {
          object: '_OTJS-START_/ref/in/object_OTJS-END_',
          array: ['foo', '_OTJS-START_/ref/in/array_OTJS-END_', 'bar'],
        },
      };

      expect(actual).toEqual(expected);
    });
  });

  describe('root object market with SCHEMA_ID_SYMBOL (alias definitions)', () => {
    it('replaces object with expected string placeholder', () => {
      // @ts-expect-error SCHEMA_ID_SYMBOL is not a valid JSON schema prop
      const actual = replaceInlinedRefsWithStringPlaceholder({
        type: 'object',
        [SCHEMA_ID_SYMBOL]: '/ref/in/root/object',
      });
      const expected = '_OTJS-START_/ref/in/root/object_OTJS-END_';

      expect(actual).toEqual(expected);
    });
  });
});
