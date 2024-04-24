import { describe, it, expect } from 'vitest';
import { pathToId } from '../../src/utils';

describe('pathToId', () => {
  it.each([
    {
      schemaRelativeDirName: 'components/schemas',
      schemaName: 'Foo',
      expected: '/components/schemas/Foo',
    },
    {
      schemaRelativeDirName: 'components/schemas/',
      schemaName: 'Foo',
      expected: '/components/schemas/Foo',
    },
    {
      schemaRelativeDirName: 'components.schemas',
      schemaName: 'Foo',
      expected: '/components/schemas/Foo',
    },
    // Windows path separators
    {
      schemaRelativeDirName: 'components\\schemas',
      schemaName: 'Foo',
      expected: '/components/schemas/Foo',
    },
    {
      schemaRelativeDirName: 'components\\schemas\\',
      schemaName: 'Foo',
      expected: '/components/schemas/Foo',
    },
  ])(
    'generates expected internal id',
    ({ schemaRelativeDirName, schemaName, expected }) => {
      const actual = pathToId({
        schemaRelativeDirName,
        schemaName,
      });

      expect(actual).toEqual(expected);
    },
  );
});
