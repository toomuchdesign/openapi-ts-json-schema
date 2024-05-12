import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { makeRelativeModulePath } from '../../src/utils';

describe('makeRelativeModulePath', () => {
  it.each([
    {
      fromDirectory: path.join(__dirname, 'test'),
      to: path.join(__dirname, 'foo', 'bar'),
      expected: './../foo/bar',
    },
    {
      fromDirectory: path.join(__dirname, 'test', 'aaa'),
      to: path.join(__dirname, 'foo', 'bar'),
      expected: './../../foo/bar',
    },
    {
      fromDirectory: path.join(__dirname, 'test'),
      to: path.join(__dirname, 'foo', 'bar'),
      expected: './../foo/bar',
    },
    {
      fromDirectory: path.join(__dirname, 'test'),
      to: path.join(__dirname, 'foo'),
      expected: './../foo',
    },
    {
      fromDirectory: path.join(__dirname, 'test'),
      to: path.join(__dirname),
      expected: './..',
    },
  ])('generates expected relative path', ({ fromDirectory, to, expected }) => {
    const actual = makeRelativeModulePath({ fromDirectory, to });
    expect(actual).toBe(expected);
  });
});
