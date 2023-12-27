import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    setupFiles: ['vitest.setup.mts'],
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
      provider: 'istanbul',
      include: ['src'],
      enabled: true,
      reporter: [['lcov', { projectRoot: './' }], ['text']],
    },
  },
});
