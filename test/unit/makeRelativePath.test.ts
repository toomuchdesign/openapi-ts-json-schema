import { describe, it, expect } from 'vitest';
import { makeRelativePath } from '../../src/utils';

describe('makeRelativePath', () => {
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
    const actual = makeRelativePath({ fromDirectory, to });
    expect(actual).toBe(expected);
  });
});
