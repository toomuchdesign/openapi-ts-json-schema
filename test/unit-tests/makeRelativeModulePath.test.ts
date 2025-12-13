import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { makeRelativeImportPath } from '../../src/utils/index.js';

const absoluteDirectoryName = '/project-root/tests';

describe('makeRelativeImportPath', () => {
  describe('moduleSystem === "cjs"', () => {
    it.each([
      {
        fromDirectory: path.join(absoluteDirectoryName, 'test'),
        toModule: path.join(absoluteDirectoryName, 'foo', 'bar'),
        expected: './../foo/bar',
      },
      {
        fromDirectory: path.join(absoluteDirectoryName, 'test', 'aaa'),
        toModule: path.join(absoluteDirectoryName, 'foo', 'bar'),
        expected: './../../foo/bar',
      },
      {
        fromDirectory: path.join(absoluteDirectoryName, 'test'),
        toModule: path.join(absoluteDirectoryName, 'foo', 'bar'),
        expected: './../foo/bar',
      },
      {
        fromDirectory: path.join(absoluteDirectoryName, 'test'),
        toModule: path.join(absoluteDirectoryName, 'foo'),
        expected: './../foo',
      },
    ])(
      'generates expected relative path',
      ({ fromDirectory, toModule, expected }) => {
        const actual = makeRelativeImportPath({
          fromDirectory,
          toModule,
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
        toModule: path.join(absoluteDirectoryName, 'foo', 'bar'),
        expected: './../foo/bar.js',
      },
      {
        fromDirectory: path.join(absoluteDirectoryName, 'test', 'aaa'),
        toModule: path.join(absoluteDirectoryName, 'foo', 'bar'),
        expected: './../../foo/bar.js',
      },
      {
        fromDirectory: path.join(absoluteDirectoryName, 'test'),
        toModule: path.join(absoluteDirectoryName, 'foo', 'bar'),
        expected: './../foo/bar.js',
      },
      {
        fromDirectory: path.join(absoluteDirectoryName, 'test'),
        toModule: path.join(absoluteDirectoryName, 'foo'),
        expected: './../foo.js',
      },
    ])(
      'generates expected relative path with extension',
      ({ fromDirectory, toModule, expected }) => {
        const actual = makeRelativeImportPath({
          fromDirectory,
          toModule,
          moduleSystem: 'esm',
        });
        expect(actual).toBe(expected);
      },
    );
  });
});
