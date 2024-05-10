import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    typecheck: { enabled: true },
    setupFiles: ['vitest.setup.ts'],
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
    exclude: ['*skipped.test*'],
    sequence: {
      hooks: 'stack',
      concurrent: false,
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
