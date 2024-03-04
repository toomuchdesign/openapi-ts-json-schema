import { describe, it, expect } from 'vitest';
import { pathToRef } from '../../src/utils';

describe('pathToRef', () => {
  it.each([
    {
      schemaRelativeDirName: 'components/schemas',
      schemaName: 'Foo',
      expected: '#/components/schemas/Foo',
    },
    {
      schemaRelativeDirName: 'components/schemas/',
      schemaName: 'Foo',
      expected: '#/components/schemas/Foo',
    },
    {
      schemaRelativeDirName: 'components.schemas',
      schemaName: 'Foo',
      expected: '#/components/schemas/Foo',
    },
    // Windows path separators
    {
      schemaRelativeDirName: 'components\\schemas',
      schemaName: 'Foo',
      expected: '#/components/schemas/Foo',
    },
    {
      schemaRelativeDirName: 'components\\schemas\\',
      schemaName: 'Foo',
      expected: '#/components/schemas/Foo',
    },
  ])(
    'generates expected ref',
    ({ schemaRelativeDirName, schemaName, expected }) => {
      const actual = pathToRef({
        schemaRelativeDirName,
        schemaName,
      });

      expect(actual).toEqual(expected);
    },
  );
});
