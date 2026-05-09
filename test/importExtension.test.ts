import fs from 'fs/promises';
import path from 'path';

import { describe, expect, it } from 'vitest';

import { openapiToTsJsonSchema } from '../src/index.js';
import { formatTypeScript } from '../src/utils/index.js';
import { fixturesPath, makeTestOutputPath } from './test-utils/index.js';

/**
 * `importExtension` only affects the suffix of relative import specifiers in
 * generated artifacts. Body emission is exercised elsewhere — these tests
 * intentionally assert only the import statements.
 */
describe('importExtension option', () => {
  describe('importExtension === "js" (default)', () => {
    it('Appends .js to relative import specifiers', async () => {
      const { outputPath } = await openapiToTsJsonSchema({
        openApiDocument: path.resolve(fixturesPath, 'complex/specs.yaml'),
        outputPath: makeTestOutputPath('importExtension-js'),
        targets: {
          collections: ['paths'],
        },
        silent: true,
        refHandling: 'import',
        importExtension: 'js',
      });

      // Can import generated schema without errors
      await import(path.resolve(outputPath, 'paths/_v1_path-1.ts'));

      const actualPath1File = await fs.readFile(
        path.resolve(outputPath, 'paths/_v1_path-1.ts'),
        { encoding: 'utf8' },
      );

      expect(actualPath1File).toContain(
        await formatTypeScript(`
          import componentsSchemasFebruary from "./../components/schemas/February.js";
          import componentsSchemasJanuary from "./../components/schemas/January.js";
        `),
      );
    });
  });

  describe('importExtension === "none"', () => {
    it('Emits relative import specifiers with no extension', async () => {
      const { outputPath } = await openapiToTsJsonSchema({
        openApiDocument: path.resolve(fixturesPath, 'complex/specs.yaml'),
        outputPath: makeTestOutputPath('importExtension-none'),
        targets: {
          collections: ['paths'],
        },
        silent: true,
        refHandling: 'import',
        importExtension: 'none',
      });

      // Can import generated schema without errors
      await import(path.resolve(outputPath, 'paths/_v1_path-1.ts'));

      const actualPath1File = await fs.readFile(
        path.resolve(outputPath, 'paths/_v1_path-1.ts'),
        { encoding: 'utf8' },
      );

      expect(actualPath1File).toContain(
        await formatTypeScript(`
          import componentsSchemasFebruary from "./../components/schemas/February";
          import componentsSchemasJanuary from "./../components/schemas/January";
        `),
      );
    });
  });

  describe('importExtension === "ts"', () => {
    it('Appends .ts to relative import specifiers', async () => {
      const { outputPath } = await openapiToTsJsonSchema({
        openApiDocument: path.resolve(fixturesPath, 'complex/specs.yaml'),
        outputPath: makeTestOutputPath('importExtension-ts'),
        targets: {
          collections: ['paths'],
        },
        silent: true,
        refHandling: 'import',
        importExtension: 'ts',
      });

      // Can import generated schema without errors
      await import(path.resolve(outputPath, 'paths/_v1_path-1.ts'));

      const actualPath1File = await fs.readFile(
        path.resolve(outputPath, 'paths/_v1_path-1.ts'),
        { encoding: 'utf8' },
      );

      expect(actualPath1File).toContain(
        await formatTypeScript(`
          import componentsSchemasFebruary from "./../components/schemas/February.ts";
          import componentsSchemasJanuary from "./../components/schemas/January.ts";
        `),
      );
    });
  });
});
