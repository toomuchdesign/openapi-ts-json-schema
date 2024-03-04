import { describe, it, expect } from 'vitest';
import { makeRelativeModulePath } from '../../src/utils';

describe('makeRelativeModulePath', () => {
  it.each([
    {
      fromDirectory: '/data/orandea/test/aaa',
      to: '/data/orandea/impl/bbb',
      expected: './../../impl/bbb',
    },
    {
      fromDirectory: '/data/orandea/test',
      to: '/data/orandea/impl/bbb',
      expected: './../impl/bbb',
    },
    {
      fromDirectory: '/data/orandea/test',
      to: '/data/orandea/test/bbb',
      expected: './bbb',
    },
  ])('generates expected relative path', ({ fromDirectory, to, expected }) => {
    const actual = makeRelativeModulePath({ fromDirectory, to });
    expect(actual).toBe(expected);
  });
});
