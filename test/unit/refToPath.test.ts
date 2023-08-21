import { describe, it, expect } from 'vitest';
import { refToPath } from '../../src/utils';

describe('refToPath', async () => {
  it('generate expected ref paths', async () => {
    const actual = refToPath({
      ref: '#/components/schema/Foo',
      outputPath: '/absolute/output/path',
    });
    const expected = {
      schemaName: 'Foo',
      schemaOutputPath: '/absolute/output/path/components.schema',
    };

    expect(actual).toEqual(expected);
  });
});
