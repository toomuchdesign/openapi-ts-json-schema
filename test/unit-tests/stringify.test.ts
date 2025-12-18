import { describe, expect, it } from 'vitest';

import { stringify } from '../../src/utils/makeTsJsonSchema/stringify.js';

describe('stringify', () => {
  it('replaces first nested circular occurrency with "{}"', () => {
    const input: { a: unknown; b: { c: unknown } } = {
      a: 'foo',
      b: {
        c: {},
      },
    };
    input['b']['c'] = input;

    const actual = JSON.parse(stringify(input));
    const expected = {
      a: 'foo',
      b: { c: {} },
    };

    expect(actual).toEqual(expected);
  });
});
