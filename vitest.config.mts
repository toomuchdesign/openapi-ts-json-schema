import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    setupFiles: ['vitest.setup.mts'],
    singleThread: true,
    sequence: {
      hooks: 'stack',
      concurrent: false,
    },
    coverage: {
      provider: 'v8',
      enabled: true,
      reporter: [['lcov'], ['text']],
    },
  },
});
