import path from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  LEADING_COMMENT_SYMBOL,
  REFERENCED_SCHEMA_ID_SYMBOL,
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
  importExtension: 'js' as const,
  idMapper: ({ id }: { id: string }) => id,
};

describe('emitTsSchema', () => {
  describe('refHandling === "inline"', () => {
    it('emits TypeScript source for primitives, arrays, and nested objects', () => {
      const result = emitTsSchema({
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

      expect(result).toEqual({
        body: [
          '{',
          '"type": "object",',
          '"required": ["name"],',
          '"properties": {',
          '"name": {',
          '"type": "string"',
          '}',
          '},',
          '"nullable": null,',
          '"count": 0,',
          '"active": true',
          '}',
        ].join('\n'),
        imports: '',
        isImportAlias: false,
      });
    });

    describe('on referenced nodes', () => {
      it('ignores REFERENCED_SCHEMA_ID_SYMBOL', () => {
        const inlinedRef = {
          type: 'string',
          [REFERENCED_SCHEMA_ID_SYMBOL]: '/components/schemas/Answer',
        };

        const result = emitTsSchema({
          rootSchema: inlinedRef,
          refHandling: 'inline',
          schemaMetaDataMap: new Map(),
          ...baseArgs,
        });

        expect(result).toEqual({
          body: ['{', '"type": "string"', '}'].join('\n'),
          imports: '',
          isImportAlias: false,
        });
      });
    });

    describe('on an empty object', () => {
      describe('no leading comment is attached', () => {
        it('emits an empty object literal', () => {
          const result = emitTsSchema({
            rootSchema: {},
            refHandling: 'inline',
            schemaMetaDataMap: new Map(),
            ...baseArgs,
          });

          expect(result).toEqual({
            body: '{\n\n}',
            imports: '',
            isImportAlias: false,
          });
        });
      });
    });

    describe('on circular references between dereferenced schemas', () => {
      it('truncates the second occurrence of an id-marked node and annotates it with that id', () => {
        const node: {
          name: string;
          self?: unknown;
          [REFERENCED_SCHEMA_ID_SYMBOL]: string;
        } = {
          name: 'cycle',
          [REFERENCED_SCHEMA_ID_SYMBOL]: '/components/schemas/Foo',
        };
        node.self = node;

        const result = emitTsSchema({
          rootSchema: node,
          refHandling: 'inline',
          schemaMetaDataMap: new Map(),
          ...baseArgs,
        });

        expect(result).toEqual({
          body: [
            '{',
            '"name": "cycle",',
            '"self": {',
            '// Circular recursion interrupted',
            '}',
            '}',
          ].join('\n'),
          imports: '',
          isImportAlias: false,
        });
      });

      it('preserves a leading comment on the truncated node', () => {
        const node: {
          name: string;
          self?: unknown;
          [REFERENCED_SCHEMA_ID_SYMBOL]: string;
          [LEADING_COMMENT_SYMBOL]: string;
        } = {
          name: 'cycle',
          [REFERENCED_SCHEMA_ID_SYMBOL]: '/components/schemas/Foo',
          [LEADING_COMMENT_SYMBOL]: ' $ref: "#/components/schemas/Foo"',
        };
        node.self = node;

        const result = emitTsSchema({
          rootSchema: node,
          refHandling: 'inline',
          schemaMetaDataMap: new Map(),
          ...baseArgs,
        });

        expect(result).toEqual({
          body: [
            '{',
            '// $ref: "#/components/schemas/Foo"',
            '"name": "cycle",',
            '"self": {',
            '// $ref: "#/components/schemas/Foo"',
            '// Circular recursion interrupted',
            '}',
            '}',
          ].join('\n'),
          imports: '',
          isImportAlias: false,
        });
      });

      it('treats sibling occurrences of the same id as independent (no false cycle)', () => {
        const shared = {
          type: 'string',
          [REFERENCED_SCHEMA_ID_SYMBOL]: '/components/schemas/Shared',
        };

        const result = emitTsSchema({
          rootSchema: { properties: { a: shared, b: shared } },
          refHandling: 'inline',
          schemaMetaDataMap: new Map(),
          ...baseArgs,
        });

        expect(result).toEqual({
          body: [
            '{',
            '"properties": {',
            '"a": {',
            '"type": "string"',
            '},',
            '"b": {',
            '"type": "string"',
            '}',
            '}',
            '}',
          ].join('\n'),
          imports: '',
          isImportAlias: false,
        });
      });
    });

    describe('the node carries a LEADING_COMMENT_SYMBOL', () => {
      it('renders the comment inside the object literal', () => {
        const inlinedRef = {
          type: 'string',
          [LEADING_COMMENT_SYMBOL]: ' $ref: "#/components/schemas/Answer"',
        };

        const result = emitTsSchema({
          rootSchema: inlinedRef,
          refHandling: 'inline',
          schemaMetaDataMap: new Map(),
          ...baseArgs,
        });

        expect(result).toEqual({
          body: [
            '{',
            '// $ref: "#/components/schemas/Answer"',
            '"type": "string"',
            '}',
          ].join('\n'),
          imports: '',
          isImportAlias: false,
        });
      });
    });
  });

  describe('refHandling === "import"', () => {
    describe('on marked nodes', () => {
      it('replaces them with imported identifiers and registers imports', () => {
        const schemaMetaDataMap: SchemaMetaDataMap = new Map();
        schemaMetaDataMap.set(
          '/components/schemas/Answer',
          makeMeta({
            id: '/components/schemas/Answer',
            uniqueName: 'componentsSchemasAnswer',
            absoluteImportPath: path.resolve('/out/components/schemas/Answer'),
          }),
        );
        schemaMetaDataMap.set(
          '/components/schemas/Question',
          makeMeta({
            id: '/components/schemas/Question',
            uniqueName: 'componentsSchemasQuestion',
            absoluteImportPath: path.resolve(
              '/out/components/schemas/Question',
            ),
          }),
        );

        const answerRef = {
          type: 'string',
          [REFERENCED_SCHEMA_ID_SYMBOL]: '/components/schemas/Answer',
        };
        const questionRef = {
          type: 'string',
          [REFERENCED_SCHEMA_ID_SYMBOL]: '/components/schemas/Question',
        };

        const result = emitTsSchema({
          rootSchema: {
            properties: { a: answerRef, b: questionRef, c: answerRef },
          },
          refHandling: 'import',
          schemaMetaDataMap,
          ...baseArgs,
        });

        expect(result).toEqual({
          body: [
            '{',
            '"properties": {',
            '"a": componentsSchemasAnswer,',
            '"b": componentsSchemasQuestion,',
            '"c": componentsSchemasAnswer',
            '}',
            '}',
          ].join('\n'),
          imports: [
            'import componentsSchemasQuestion from "./Question.js"',
            'import componentsSchemasAnswer from "./Answer.js"',
            '',
          ].join('\n'),
          isImportAlias: false,
        });
      });
    });

    describe('the root schema is itself a marked reference', () => {
      it('flags the result as an import alias', () => {
        const schemaMetaDataMap: SchemaMetaDataMap = new Map();
        schemaMetaDataMap.set(
          '/components/schemas/Answer',
          makeMeta({
            id: '/components/schemas/Answer',
            uniqueName: 'componentsSchemasAnswer',
            absoluteImportPath: path.resolve('/out/components/schemas/Answer'),
          }),
        );

        const result = emitTsSchema({
          rootSchema: {
            type: 'string',
            [REFERENCED_SCHEMA_ID_SYMBOL]: '/components/schemas/Answer',
          },
          refHandling: 'import',
          schemaMetaDataMap,
          ...baseArgs,
        });

        expect(result).toEqual({
          body: 'componentsSchemasAnswer',
          imports: 'import componentsSchemasAnswer from "./Answer.js"\n',
          isImportAlias: true,
        });
      });
    });
  });

  describe('refHandling === "keep"', () => {
    describe('on marked nodes', () => {
      it('emits "{ $ref: ... }" object literals', () => {
        const schemaMetaDataMap: SchemaMetaDataMap = new Map();
        const inlinedRef = {
          type: 'string',
          [REFERENCED_SCHEMA_ID_SYMBOL]: '/components/schemas/Answer',
        };

        const result = emitTsSchema({
          rootSchema: { properties: { a: inlinedRef } },
          refHandling: 'keep',
          schemaMetaDataMap,
          ...baseArgs,
          idMapper: ({ id }) => `#${id}`,
        });

        expect(result).toEqual({
          body: [
            '{',
            '"properties": {',
            '"a": { $ref: "#/components/schemas/Answer" }',
            '}',
            '}',
          ].join('\n'),
          imports: '',
          isImportAlias: false,
        });
      });
    });
  });
});
