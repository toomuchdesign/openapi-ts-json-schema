import { describe, it, expect } from 'vitest';
import { refToPath } from '../../src/utils';

describe('refToPath', async () => {
  it('generate expected ref paths', async () => {
    const actual = refToPath('#/components/schema/Foo');
    const expected = {
      schemaName: 'Foo',
      schemaRelativeDirName: 'components.schema',
      schemaRelativePath: 'components.schema/Foo',
    };

    expect(actual).toEqual(expected);
  });
});
