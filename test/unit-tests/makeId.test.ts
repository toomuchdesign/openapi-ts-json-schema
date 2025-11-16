import { describe, expect, it } from 'vitest';

import { makeId } from '../../src/utils';

describe('makeId', () => {
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
    {
      schemaRelativeDirName: 'components.schemas',
      schemaName: 'Foo/bar',
      expected: '/components/schemas/Foo_bar',
    },
    {
      schemaRelativeDirName: 'components/schemas',
      schemaName: 'Foo/bar',
      expected: '/components/schemas/Foo_bar',
    },
    {
      schemaRelativeDirName: 'paths',
      schemaName: '/users',
      expected: '/paths/_users',
    },
    {
      schemaRelativeDirName: 'paths',
      schemaName: '/',
      expected: '/paths/_',
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
      const actual = makeId({
        schemaRelativeDirName,
        schemaName,
      });

      expect(actual).toEqual(expected);
    },
  );
});
