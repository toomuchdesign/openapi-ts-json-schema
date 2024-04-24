import { describe, it, expect } from 'vitest';
import { idToPath } from '../../src/utils';

describe('idToPath', () => {
  it('generates expected ref paths', () => {
    const actual = idToPath('/components/schema/Foo');
    const expected = {
      schemaRelativeDirName: 'components/schema',
      schemaName: 'Foo',
    };

    expect(actual).toEqual(expected);
  });
});
