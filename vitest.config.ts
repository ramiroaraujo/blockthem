import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
    passWithNoTests: true,
  },
  resolve: {
    alias: {
      'vitest-chrome': new URL('./node_modules/vitest-chrome/lib/index.esm.js', import.meta.url).pathname,
    },
  },
})
