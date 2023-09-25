import { describe, it, expect } from 'vitest';
import {
  replaceInlinedRefsWithStringPlaceholder,
  REF_SYMBOL,
} from '../../src/utils';

describe('replaceInlinedRefsWithStringPlaceholder', () => {
  describe('nested object market with REF_SYMBOL', () => {
    it('replaces objects with expected string placeholder', () => {
      const actual = replaceInlinedRefsWithStringPlaceholder({
        schemas: {
          object: {
            foo: 'bar',
            [REF_SYMBOL]: '#/ref/in/object',
          },
          array: [
            'foo',
            { hello: 'world', [REF_SYMBOL]: '#/ref/in/array' },
            'bar',
          ],
        },
      });

      const expected = {
        schemas: {
          object: '_OTJS-START_#/ref/in/object_OTJS-END_',
          array: ['foo', '_OTJS-START_#/ref/in/array_OTJS-END_', 'bar'],
        },
      };

      expect(actual).toEqual(expected);
    });
  });

  describe('root object market with REF_SYMBOL (alias definitions)', () => {
    it('replaces object with expected string placeholder', () => {
      // @ts-expect-error REF_SYMBOL is not a valid JSON schema prop
      const actual = replaceInlinedRefsWithStringPlaceholder({
        type: 'object',
        [REF_SYMBOL]: '#/ref/in/root/object',
      });
      const expected = '_OTJS-START_#/ref/in/root/object_OTJS-END_';

      expect(actual).toEqual(expected);
    });
  });
});
