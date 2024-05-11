import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { addSchemaToMetaData } from '../../src/utils';
import type { SchemaMetaData } from '../../src/types';

describe('addSchemaToMetaData', () => {
  it('generates expected metadata', () => {
    const id = '/components/schemas/Foo';
    const $id = '$/components/schemas/Foo';
    const schemaMetaDataMap = new Map();
    const outputPath = path.normalize('/absolute/output/path');
    const schema = {
      description: 'Schema description',
      type: 'object' as const,
      required: ['bar'],
      properties: { bar: { type: 'string' } } as const,
    };

    addSchemaToMetaData({
      id,
      $id,
      schemaMetaDataMap,
      schema,
      outputPath,
      isRef: true,
    });

    const actual = schemaMetaDataMap.get(id);
    const expected: SchemaMetaData = {
      id: '/components/schemas/Foo',
      $id: '$/components/schemas/Foo',
      uniqueName: 'componentsSchemasFoo',
      isRef: true,
      originalSchema: schema,

      absoluteDirName: '/absolute/output/path/components/schemas'.replaceAll(
        '/',
        path.sep,
      ),
      absoluteImportPath:
        '/absolute/output/path/components/schemas/Foo'.replaceAll(
          '/',
          path.sep,
        ),
      absolutePath:
        '/absolute/output/path/components/schemas/Foo.ts'.replaceAll(
          '/',
          path.sep,
        ),
    };

    expect(actual).toEqual(expected);
  });
});
