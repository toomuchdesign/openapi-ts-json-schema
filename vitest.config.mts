import { defaultInclude, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    dir: './test',
    typecheck: {
      enabled: false,
      include: defaultInclude,
    },
    restoreMocks: true,
    setupFiles: ['vitest.setup.ts'],
    /**
     * "forks" cause the following error:
     * "transformResult" in not defined. This is a bug in Vitest.
     */
    pool: 'threads',
    exclude: ['*skipped.test*'],
    sequence: {
      shuffle: true,
    },
    coverage: {
      provider: 'v8',
      include: ['src'],
      enabled: true,
      reporter: [['lcov', { projectRoot: './' }], ['text']],
    },
  },
});
