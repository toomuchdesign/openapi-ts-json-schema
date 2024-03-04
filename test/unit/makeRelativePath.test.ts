import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { makeRelativePath } from '../../src/utils';

describe('makeRelativePath', () => {
  it.each([
    {
      fromDirectory: '/data/orandea/test/aaa',
      to: '/data/orandea/impl/bbb',
      // Take into account different OS path separators ("/" vs "\")
      expected: './../../impl/bbb'.replaceAll('/', path.sep),
    },
    {
      fromDirectory: '/data/orandea/test',
      to: '/data/orandea/impl/bbb',
      // Take into account different OS path separators ("/" vs "\")
      expected: './../impl/bbb'.replaceAll('/', path.sep),
    },
    {
      fromDirectory: '/data/orandea/test',
      to: '/data/orandea/test/bbb',
      // Take into account different OS path separators ("/" vs "\")
      expected: './bbb'.replaceAll('/', path.sep),
    },
  ])('generates expected relative path', ({ fromDirectory, to, expected }) => {
    const actual = makeRelativePath({ fromDirectory, to });
    expect(actual).toBe(expected);
  });
});
