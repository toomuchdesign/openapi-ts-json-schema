/**
 * DELETE THIS FILE WHEN REMOVING THE DEPRECATED `moduleSystem` OPTION (v3).
 *
 * These tests cover backwards-compatibility behaviour for the deprecated
 * `moduleSystem` option. Once the option is removed, this entire file —
 * along with the resolution block in `src/openapiToTsJsonSchema.ts` and the
 * `ModuleSystem` type / `Options.moduleSystem` field in `src/types.ts` — can
 * be deleted without affecting any forward-looking tests.
 */
import fs from 'fs/promises';
import path from 'path';

import { describe, expect, it } from 'vitest';

import { openapiToTsJsonSchema } from '../src/index.js';
import { formatTypeScript } from '../src/utils/index.js';
import { fixturesPath, makeTestOutputPath } from './test-utils/index.js';

describe('moduleSystem option === "cjs"', () => {
  describe('refHandling option === "import"', () => {
    it('Generates imports without explicit .js extensions', async () => {
      const { outputPath } = await openapiToTsJsonSchema({
        openApiDocument: path.resolve(fixturesPath, 'complex/specs.yaml'),
        outputPath: makeTestOutputPath('refHandling-import'),
        targets: {
          collections: ['paths'],
        },
        silent: true,
        refHandling: 'import',
        moduleSystem: 'cjs',
      });

      // Can import generated schema without errors
      await import(path.resolve(outputPath, 'paths/_v1_path-1'));

      const actualPath1File = await fs.readFile(
        path.resolve(outputPath, 'paths/_v1_path-1.ts'),
        {
          encoding: 'utf8',
        },
      );

      // Generates expected imports with .js extensions
      const expectedPath1File = await formatTypeScript(`
          import componentsSchemasFebruary from "./../components/schemas/February";
          import componentsSchemasJanuary from "./../components/schemas/January";

          const schema = {
            get: {
              responses: {
                "200": {
                  description: "A description",
                  content: {
                    "application/json": {
                      schema: {
                        oneOf: [
                          componentsSchemasJanuary,
                          componentsSchemasFebruary,
                          {
                            type: ["integer", "null"],
                            enum: [1, 0, null],
                            description: "Inline path schema",
                          },
                        ],
                      },
                    },
                  },
                },
              },
            },
          } as const;
          export default schema;`);

      expect(actualPath1File).toEqual(expectedPath1File);
    });
  });
});

describe('moduleSystem option precedence', () => {
  it('is ignored when `importExtension` is also provided', async () => {
    const { outputPath } = await openapiToTsJsonSchema({
      openApiDocument: path.resolve(fixturesPath, 'complex/specs.yaml'),
      outputPath: makeTestOutputPath('moduleSystem-and-importExtension'),
      targets: {
        collections: ['paths'],
      },
      silent: true,
      refHandling: 'import',
      // Conflicting values: importExtension wins, moduleSystem is ignored.
      importExtension: 'none',
      moduleSystem: 'esm',
    });

    const actualPath1File = await fs.readFile(
      path.resolve(outputPath, 'paths/_v1_path-1.ts'),
      { encoding: 'utf8' },
    );

    expect(actualPath1File).toContain(
      'from "./../components/schemas/February"',
    );
    expect(actualPath1File).not.toContain(
      'from "./../components/schemas/February.js"',
    );
  });
});
