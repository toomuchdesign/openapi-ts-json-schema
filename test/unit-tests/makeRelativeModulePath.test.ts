import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { makeRelativeModulePath } from '../../src/utils';

const absoluteDirectoryName = '/project-root/tests';

describe('makeRelativeModulePath', () => {
  describe('moduleSystem === "cjs"', () => {
    it.each([
      {
        fromDirectory: path.join(absoluteDirectoryName, 'test'),
        to: path.join(absoluteDirectoryName, 'foo', 'bar'),
        expected: './../foo/bar',
      },
      {
        fromDirectory: path.join(absoluteDirectoryName, 'test', 'aaa'),
        to: path.join(absoluteDirectoryName, 'foo', 'bar'),
        expected: './../../foo/bar',
      },
      {
        fromDirectory: path.join(absoluteDirectoryName, 'test'),
        to: path.join(absoluteDirectoryName, 'foo', 'bar'),
        expected: './../foo/bar',
      },
      {
        fromDirectory: path.join(absoluteDirectoryName, 'test'),
        to: path.join(absoluteDirectoryName, 'foo'),
        expected: './../foo',
      },
    ])(
      'generates expected relative path',
      ({ fromDirectory, to, expected }) => {
        const actual = makeRelativeModulePath({
          fromDirectory,
          to,
          moduleSystem: 'cjs',
        });
        expect(actual).toBe(expected);
      },
    );
  });

  describe('moduleSystem === "esm"', () => {
    it.each([
      {
        fromDirectory: path.join(absoluteDirectoryName, 'test'),
        to: path.join(absoluteDirectoryName, 'foo', 'bar'),
        expected: './../foo/bar.js',
      },
      {
        fromDirectory: path.join(absoluteDirectoryName, 'test', 'aaa'),
        to: path.join(absoluteDirectoryName, 'foo', 'bar'),
        expected: './../../foo/bar.js',
      },
      {
        fromDirectory: path.join(absoluteDirectoryName, 'test'),
        to: path.join(absoluteDirectoryName, 'foo', 'bar'),
        expected: './../foo/bar.js',
      },
      {
        fromDirectory: path.join(absoluteDirectoryName, 'test'),
        to: path.join(absoluteDirectoryName, 'foo'),
        expected: './../foo.js',
      },
    ])(
      'generates expected relative path with extension',
      ({ fromDirectory, to, expected }) => {
        const actual = makeRelativeModulePath({
          fromDirectory,
          to,
          moduleSystem: 'esm',
        });
        expect(actual).toBe(expected);
      },
    );
  });
});
