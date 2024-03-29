import { describe, it, expect } from 'vitest';
import { refToPath } from '../../src/utils';

describe('refToPath', () => {
  it('generates expected ref paths', () => {
    const actual = refToPath('#/components/schema/Foo');
    const expected = {
      schemaRelativeDirName: 'components/schema',
      schemaName: 'Foo',
    };

    expect(actual).toEqual(expected);
  });
});
