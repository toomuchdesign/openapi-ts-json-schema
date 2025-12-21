import { describe, expect, it } from 'vitest';

import { parseSingleItemPath } from '../../src/utils/parseSingleItemPath.js';

describe('parseSingleItemPath util', () => {
  describe('aaa.bbb.ccc', () => {
    it('parses path correctly', () => {
      const actual = parseSingleItemPath('aaa.bbb.ccc');
      const expected = {
        schemaRelativeDirName: 'aaa.bbb',
        schemaName: 'ccc',
      };

      expect(actual).toEqual(expected);
    });
  });

  describe('aaa.bbb', () => {
    it('parses path correctly', () => {
      const actual = parseSingleItemPath('aaa.bbb');
      const expected = {
        schemaRelativeDirName: 'aaa',
        schemaName: 'bbb',
      };

      expect(actual).toEqual(expected);
    });
  });

  describe('aaa', () => {
    it('parses path correctly', () => {
      const actual = parseSingleItemPath('aaa');
      const expected = {
        schemaRelativeDirName: '',
        schemaName: 'aaa',
      };

      expect(actual).toEqual(expected);
    });
  });

  describe('empty string', () => {
    it('throws expected error', () => {
      expect(() => parseSingleItemPath('')).toThrow(
        new Error(
          '[openapi-ts-json-schema] target not found in OAS definition: ""',
        ),
      );
    });
  });

  describe('path with trailing "."', () => {
    it('throws expected error', () => {
      expect(() => parseSingleItemPath('aaa.bbb.')).toThrow(
        new Error(
          '[openapi-ts-json-schema] target not found in OAS definition: "aaa.bbb."',
        ),
      );
    });
  });
});
