import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

const projectRoot = import.meta.dirname ?? resolve('.')

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(projectRoot, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
})
