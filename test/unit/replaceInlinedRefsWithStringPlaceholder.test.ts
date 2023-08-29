import { describe, it, expect } from 'vitest';
import {
  replaceInlinedRefsWithStringPlaceholder,
  REF_SYMBOL,
} from '../../src/utils';

describe('replaceInlinedRefsWithStringPlaceholder', () => {
  it('replaces objects marked with REF_SYMBOL with expected string placeholder', () => {
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
