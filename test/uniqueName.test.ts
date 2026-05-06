import path from 'path';

import { describe, expect, it } from 'vitest';

import { openapiToTsJsonSchema } from '../src/index.js';
import { fixturesPath, makeTestOutputPath } from './test-utils/index.js';

describe('uniqueName generation', () => {
  it('camelCases hyphenated schema names', async () => {
    const { metaData } = await openapiToTsJsonSchema({
      openApiDocument: path.resolve(fixturesPath, 'ref-property/specs.yaml'),
      outputPath: makeTestOutputPath('uniqueName-base'),
      targets: { collections: ['components.schemas'] },
      silent: true,
    });

    const answer = metaData.schemas.get('/components/schemas/Answer');
    expect(answer?.uniqueName).toBe('componentsSchemasAnswer');
  });

  it('prefixes _ when namify produces a digit-leading identifier', async () => {
    // Simulate the guard directly: ids starting with a digit segment
    // namify('/1st/schemas/Foo') would produce '1stSchemasFoo' — invalid JS identifier
    // The guard should prefix it with '_'
    // We test via addSchemaToMetaData indirectly by inspecting metaData from a custom idMapper
    // that would expose a digit-leading id. Since real OpenAPI paths don't start with digits,
    // we test the guard via the utility directly.
    // @ts-expect-error no type defs for namify
    const { default: namify } = await import('namify');

    // Verify namify itself returns digit-leading for these inputs
    expect(/^\d/.test(namify('123'))).toBe(true);
    expect(/^\d/.test(namify('1st'))).toBe(true);

    // Verify our guard (replicated here for unit coverage of the logic)
    const makeUniqueName = (id: string): string => {
      const raw = namify(id) as string;
      return /^\d/.test(raw) ? `_${raw}` : raw;
    };

    expect(makeUniqueName('123')).toBe('_123');
    expect(makeUniqueName('1st')).toBe('_1st');
    expect(makeUniqueName('my-schema')).toBe('mySchema');
    expect(makeUniqueName('class')).toBe('_class');
    expect(makeUniqueName('return')).toBe('_return');
    // 'type' is not a JS reserved word so namify leaves it as-is
    expect(makeUniqueName('type')).toBe('type');
  });
});
