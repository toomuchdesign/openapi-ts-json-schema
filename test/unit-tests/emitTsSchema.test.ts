import path from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  COMMENT_JSON_BEFORE_SYMBOL,
  SCHEMA_ID_SYMBOL,
} from '../../src/constants.js';
import type { SchemaMetaData, SchemaMetaDataMap } from '../../src/types.js';
import { emitTsSchema } from '../../src/utils/makeTsJsonSchema/emitTsSchema.js';

const ABS_DIR = path.resolve('/out/components/schemas');

function makeMeta(overrides: Partial<SchemaMetaData>): SchemaMetaData {
  return {
    id: '/components/schemas/Foo',
    $id: '/components/schemas/Foo',
    isRef: true,
    shouldBeGenerated: true,
    uniqueName: 'componentsSchemasFoo',
    originalSchema: {},
    absoluteDirName: path.resolve('/out/components/schemas'),
    absoluteImportPath: path.resolve('/out/components/schemas/Foo'),
    absolutePath: path.resolve('/out/components/schemas/Foo.ts'),
    ...overrides,
  };
}

const baseArgs = {
  absoluteDirName: ABS_DIR,
  moduleSystem: 'esm' as const,
  idMapper: ({ id }: { id: string }) => id,
};

describe('emitTsSchema', () => {
  it('emits primitives, arrays, and nested objects as TypeScript source', () => {
    const { body, imports, isImportAlias } = emitTsSchema({
      rootSchema: {
        type: 'object',
        required: ['name'],
        properties: { name: { type: 'string' } },
        nullable: null,
        count: 0,
        active: true,
      },
      refHandling: 'inline',
      schemaMetaDataMap: new Map(),
      ...baseArgs,
    });

    expect(imports).toBe('');
    expect(isImportAlias).toBe(false);
    // Newlines around object body keep Prettier from collapsing it later
    expect(body).toContain('{\n"type": "object"');
    expect(body).toContain('"required": ["name"]');
    expect(body).toContain(
      '"properties": {\n"name": {\n"type": "string"\n}\n}',
    );
    expect(body).toContain('"nullable": null');
    expect(body).toContain('"count": 0');
    expect(body).toContain('"active": true');
  });

  it('replaces marked nodes with imported identifiers and registers imports', () => {
    const schemaMetaDataMap: SchemaMetaDataMap = new Map();
    schemaMetaDataMap.set(
      '/components/schemas/Answer',
      makeMeta({
        id: '/components/schemas/Answer',
        uniqueName: 'componentsSchemasAnswer',
        absoluteImportPath: path.resolve('/out/components/schemas/Answer'),
      }),
    );

    const inlinedRef = {
      type: 'string',
      [SCHEMA_ID_SYMBOL]: '/components/schemas/Answer',
    };

    const { body, imports, isImportAlias } = emitTsSchema({
      rootSchema: { properties: { a: inlinedRef, b: inlinedRef } },
      refHandling: 'import',
      schemaMetaDataMap,
      ...baseArgs,
    });

    expect(isImportAlias).toBe(false);
    // Identifier substitution, not stringified placeholder
    expect(body).toContain('"a": componentsSchemasAnswer');
    expect(body).toContain('"b": componentsSchemasAnswer');
    // Single import even though referenced twice
    expect(imports).toBe('import componentsSchemasAnswer from "./Answer.js"\n');
  });

  it('emits "{ $ref: ... }" object literals in keep mode', () => {
    const schemaMetaDataMap: SchemaMetaDataMap = new Map();
    const inlinedRef = {
      type: 'string',
      [SCHEMA_ID_SYMBOL]: '/components/schemas/Answer',
    };

    const { body, imports } = emitTsSchema({
      rootSchema: { properties: { a: inlinedRef } },
      refHandling: 'keep',
      schemaMetaDataMap,
      ...baseArgs,
      idMapper: ({ id }) => `#${id}`,
    });

    expect(imports).toBe('');
    expect(body).toContain('"a": { $ref: "#/components/schemas/Answer" }');
  });

  it('flags root-level marked schemas as import aliases', () => {
    const schemaMetaDataMap: SchemaMetaDataMap = new Map();
    schemaMetaDataMap.set(
      '/components/schemas/Answer',
      makeMeta({
        id: '/components/schemas/Answer',
        uniqueName: 'componentsSchemasAnswer',
        absoluteImportPath: path.resolve('/out/components/schemas/Answer'),
      }),
    );

    const { body, isImportAlias } = emitTsSchema({
      rootSchema: {
        type: 'string',
        [SCHEMA_ID_SYMBOL]: '/components/schemas/Answer',
      },
      refHandling: 'import',
      schemaMetaDataMap,
      ...baseArgs,
    });

    expect(isImportAlias).toBe(true);
    expect(body).toBe('componentsSchemasAnswer');
  });

  it('ignores SCHEMA_ID_SYMBOL in inline mode', () => {
    const inlinedRef = {
      type: 'string',
      [SCHEMA_ID_SYMBOL]: '/components/schemas/Answer',
    };

    const { body, imports, isImportAlias } = emitTsSchema({
      rootSchema: inlinedRef,
      refHandling: 'inline',
      schemaMetaDataMap: new Map(),
      ...baseArgs,
    });

    expect(imports).toBe('');
    expect(isImportAlias).toBe(false);
    expect(body).toContain('"type": "string"');
  });

  it('renders comment-json LineComment markers as JS line comments', () => {
    const inlinedRef = {
      type: 'string',
      [COMMENT_JSON_BEFORE_SYMBOL]: [
        { type: 'LineComment', value: ' $ref: "#/components/schemas/Answer"' },
      ],
    };

    const { body } = emitTsSchema({
      rootSchema: inlinedRef,
      refHandling: 'inline',
      schemaMetaDataMap: new Map(),
      ...baseArgs,
    });

    expect(body).toContain('// $ref: "#/components/schemas/Answer"');
  });

  it('replaces circular references with "{}"', () => {
    const node: { name: string; self?: unknown } = { name: 'cycle' };
    node.self = node;

    const { body } = emitTsSchema({
      rootSchema: node,
      refHandling: 'inline',
      schemaMetaDataMap: new Map(),
      ...baseArgs,
    });

    expect(body).toContain('"name": "cycle"');
    expect(body).toContain('"self": {}');
  });

  it('emits empty object literal for {} without leading comments', () => {
    const { body } = emitTsSchema({
      rootSchema: {},
      refHandling: 'inline',
      schemaMetaDataMap: new Map(),
      ...baseArgs,
    });

    expect(body).toBe(`{\n\n}`);
  });
});
