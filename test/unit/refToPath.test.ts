import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { refToPath } from '../../src/utils';

describe('refToPath', () => {
  it('generates expected ref paths', () => {
    const actual = refToPath('#/components/schema/Foo');
    const expected = {
      schemaRelativeDirName: 'components/schema',
      schemaName: 'Foo',
      schemaRelativePath: 'components/schema/Foo'.replaceAll('/', path.sep),
    };

    expect(actual).toEqual(expected);
  });
});
