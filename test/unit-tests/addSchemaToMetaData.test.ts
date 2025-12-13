import path from 'node:path';

import { describe, expect, it } from 'vitest';

import type { SchemaMetaData } from '../../src/types.js';
import { addSchemaToMetaData } from '../../src/utils/index.js';

describe('addSchemaToMetaData', () => {
  it('generates expected metadata', () => {
    const id = '/components/schemas/Foo';
    const $id = '$/components/schemas/Foo';
    const schemaMetaDataMap = new Map();
    const outputPath = path.normalize('/absolute/output/path');
    const openApiDefinition = {
      description: 'OpenApi description',
      type: 'object' as const,
      required: ['bar'],
      properties: { bar: { type: 'string' } } as const,
    };
    const jsonSchema = {
      description: 'JsonSchema description',
      type: 'object' as const,
      required: ['bar'],
      properties: { bar: { type: 'string' } } as const,
    };

    addSchemaToMetaData({
      id,
      $id,
      schemaMetaDataMap,
      openApiDefinition,
      jsonSchema,
      outputPath,
      isRef: true,
      shouldBeGenerated: true,
    });

    const actual = schemaMetaDataMap.get(id);
    const expected: SchemaMetaData = {
      id: '/components/schemas/Foo',
      $id: '$/components/schemas/Foo',
      uniqueName: 'componentsSchemasFoo',
      isRef: true,
      shouldBeGenerated: true,
      openApiDefinition,
      originalSchema: jsonSchema,

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
