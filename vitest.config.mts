import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    typecheck: { enabled: true },
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
  // https://github.com/vitest-dev/vitest/issues/6152
  server: {
    fs: {
      cachedChecks: false,
    },
  },
});
