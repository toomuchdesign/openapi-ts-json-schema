import { defineConfig, defaultInclude } from 'vitest/config';

export default defineConfig({
  test: {
    dir: './test',
    typecheck: {
      enabled: true,
      include: defaultInclude,
    },
    setupFiles: ['vitest.setup.ts'],
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
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
