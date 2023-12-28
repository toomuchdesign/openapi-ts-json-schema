import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    setupFiles: ['vitest.setup.ts'],
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
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
