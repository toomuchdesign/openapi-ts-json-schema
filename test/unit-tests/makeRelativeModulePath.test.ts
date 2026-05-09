import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { makeRelativeImportPath } from '../../src/utils/index.js';

const absoluteDirectoryName = '/project-root/tests';

describe('makeRelativeImportPath', () => {
  describe('importExtension === "none"', () => {
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
      'generates expected relative path without extension',
      ({ fromDirectory, toModule, expected }) => {
        const actual = makeRelativeImportPath({
          fromDirectory,
          toModule,
          importExtension: 'none',
        });
        expect(actual).toBe(expected);
      },
    );
  });

  describe('importExtension === "js"', () => {
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
      'generates expected relative path with .js extension',
      ({ fromDirectory, toModule, expected }) => {
        const actual = makeRelativeImportPath({
          fromDirectory,
          toModule,
          importExtension: 'js',
        });
        expect(actual).toBe(expected);
      },
    );
  });

  describe('importExtension === "ts"', () => {
    it.each([
      {
        fromDirectory: path.join(absoluteDirectoryName, 'test'),
        toModule: path.join(absoluteDirectoryName, 'foo', 'bar'),
        expected: './../foo/bar.ts',
      },
      {
        fromDirectory: path.join(absoluteDirectoryName, 'test', 'aaa'),
        toModule: path.join(absoluteDirectoryName, 'foo', 'bar'),
        expected: './../../foo/bar.ts',
      },
      {
        fromDirectory: path.join(absoluteDirectoryName, 'test'),
        toModule: path.join(absoluteDirectoryName, 'foo', 'bar'),
        expected: './../foo/bar.ts',
      },
      {
        fromDirectory: path.join(absoluteDirectoryName, 'test'),
        toModule: path.join(absoluteDirectoryName, 'foo'),
        expected: './../foo.ts',
      },
    ])(
      'generates expected relative path with .ts extension',
      ({ fromDirectory, toModule, expected }) => {
        const actual = makeRelativeImportPath({
          fromDirectory,
          toModule,
          importExtension: 'ts',
        });
        expect(actual).toBe(expected);
      },
    );
  });
});
