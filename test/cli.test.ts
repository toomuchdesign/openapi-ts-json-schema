import fs from 'node:fs';
import path from 'node:path';

import { runCommand } from 'citty';
import { describe, expect, it, vi } from 'vitest';

import { cliCommand } from '../src/cli/cliCommand.js';
import { loadConfig } from '../src/loadConfig.js';
import * as openapiToTsJsonSchemaModule from '../src/openapiToTsJsonSchema.js';
import { fixturesPath, makeTestOutputPath } from './test-utils/index.js';

describe('CLI', () => {
  describe('flags mode', () => {
    it('generates schemas from a collection target and forwards the expected options', async () => {
      const outputPath = makeTestOutputPath('flags-collection');
      const documentPath = path.resolve(
        fixturesPath,
        'ref-property/specs.yaml',
      );

      const spy = vi.spyOn(
        openapiToTsJsonSchemaModule,
        'openapiToTsJsonSchema',
      );

      await runCommand(cliCommand, {
        rawArgs: [
          '--input',
          documentPath,
          '--collections',
          'components.schemas',
          '--output',
          outputPath,
          '--import-extension',
          'ts',
          '--ref-handling',
          'inline',
          '--silent',
        ],
      });

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith({
        openApiDocument: documentPath,
        targets: {
          collections: ['components.schemas'],
          single: [],
        },
        outputPath,
        importExtension: 'ts',
        refHandling: 'inline',
        silent: true,
      });

      expect(
        fs.existsSync(path.resolve(outputPath, 'components/schemas/Answer.ts')),
      ).toBe(true);
    });

    it('generates schemas from a single target and forwards the expected options', async () => {
      const outputPath = makeTestOutputPath('flags-single');
      const documentPath = path.resolve(
        fixturesPath,
        'ref-property/specs.yaml',
      );

      const spy = vi.spyOn(
        openapiToTsJsonSchemaModule,
        'openapiToTsJsonSchema',
      );

      await runCommand(cliCommand, {
        rawArgs: [
          '--input',
          documentPath,
          '--single',
          'components.schemas.Answer',
          '--output',
          outputPath,
          '--silent',
        ],
      });

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith({
        openApiDocument: documentPath,
        targets: {
          collections: [],
          single: ['components.schemas.Answer'],
        },
        outputPath,
        importExtension: undefined,
        refHandling: undefined,
        silent: true,
      });
    });

    it('throws when --input is missing', async () => {
      await expect(
        runCommand(cliCommand, {
          rawArgs: ['--collections', 'components.schemas'],
        }),
      ).rejects.toThrow(/--input is required/);
    });
  });

  describe('--config mode', () => {
    it('loads options from a TypeScript config file and forwards them as-is', async () => {
      const configPath = path.resolve(fixturesPath, 'cli-configs/valid.ts');
      const expectedOptions = (await import('./fixtures/cli-configs/valid.js'))
        .default;

      const spy = vi.spyOn(
        openapiToTsJsonSchemaModule,
        'openapiToTsJsonSchema',
      );

      await runCommand(cliCommand, {
        rawArgs: ['--config', configPath],
      });

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(expectedOptions);

      expect(
        fs.existsSync(
          path.resolve(
            expectedOptions.outputPath!,
            'components/schemas/Answer.ts',
          ),
        ),
      ).toBe(true);
    });

    describe('combined with other flags', () => {
      it('throws', async () => {
        await expect(
          runCommand(cliCommand, {
            rawArgs: ['--config', '/nonexistent/config.ts', '--input', 'foo'],
          }),
        ).rejects.toThrow(
          /--config cannot be combined with other option flags/,
        );
      });
    });

    describe('config file does not exist', () => {
      it('throws', async () => {
        await expect(
          runCommand(cliCommand, {
            rawArgs: ['--config', '/nonexistent/config.ts'],
          }),
        ).rejects.toThrow(/Config file not found/);
      });
    });

    describe('config default export is not an object', () => {
      it('throws', async () => {
        const configPath = path.resolve(
          fixturesPath,
          'cli-configs/non-object-default.ts',
        );

        await expect(loadConfig(configPath)).rejects.toThrow(
          /must export an Options object/,
        );
      });
    });

    describe('config has no default export', () => {
      it('returns the module namespace as-is', async () => {
        const configPath = path.resolve(
          fixturesPath,
          'cli-configs/no-default-export.ts',
        );

        const result = await loadConfig(configPath);
        expect(result).toMatchObject({ foo: 1 });
      });
    });
  });

  describe('entry point', () => {
    it('runs end-to-end when src/cli/index.ts is imported', async () => {
      const outputPath = makeTestOutputPath('cli-entry');
      const documentPath = path.resolve(
        fixturesPath,
        'ref-property/specs.yaml',
      );

      const spy = vi.spyOn(
        openapiToTsJsonSchemaModule,
        'openapiToTsJsonSchema',
      );

      const originalArgv = process.argv;
      process.argv = [
        'node',
        'cli.js',
        '--input',
        documentPath,
        '--collections',
        'components.schemas',
        '--output',
        outputPath,
        '--silent',
      ];

      try {
        await import('../src/cli/index.js');
      } finally {
        process.argv = originalArgv;
      }

      expect(spy).toHaveBeenCalledTimes(1);
      expect(
        fs.existsSync(path.resolve(outputPath, 'components/schemas/Answer.ts')),
      ).toBe(true);
    });
  });
});
