import { describe, it, expect } from 'vitest';
import { makeCircularRefReplacer } from '../src/utils/makeTsJsonSchema/makeCircularRefReplacer';

describe('makeCircularRefReplacer', () => {
  it('replaces first nested circular occurrency with "{}"', () => {
    const input: { a: unknown; b: { c: unknown } } = {
      a: 'foo',
      b: {
        c: {},
      },
    };
    input['b']['c'] = input;

    const actual = JSON.parse(JSON.stringify(input, makeCircularRefReplacer()));
    const expected = {
      a: 'foo',
      b: { c: {} },
    };

    expect(actual).toEqual(expected);
  });
});
