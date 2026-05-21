import fs from 'node:fs';
import path from 'node:path';

import { runCommand } from 'citty';
import { describe, expect, it, vi } from 'vitest';

import { cliCommand } from '../src/cliCommand.js';
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
      const outputPath = makeTestOutputPath('config-mode');
      const documentPath = path.resolve(
        fixturesPath,
        'ref-property/specs.yaml',
      );

      const configPath = path.resolve(outputPath, '..', 'config.ts');
      fs.mkdirSync(path.dirname(configPath), { recursive: true });
      fs.writeFileSync(
        configPath,
        `import type { Options } from '${path.resolve('src/types.ts')}';
const config: Options = {
  openApiDocument: ${JSON.stringify(documentPath)},
  targets: { collections: ['components.schemas'] },
  outputPath: ${JSON.stringify(outputPath)},
  silent: true,
};
export default config;
`,
      );

      const spy = vi.spyOn(
        openapiToTsJsonSchemaModule,
        'openapiToTsJsonSchema',
      );

      await runCommand(cliCommand, {
        rawArgs: ['--config', configPath],
      });

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith({
        openApiDocument: documentPath,
        targets: { collections: ['components.schemas'] },
        outputPath,
        silent: true,
      });

      expect(
        fs.existsSync(path.resolve(outputPath, 'components/schemas/Answer.ts')),
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
  });
});
