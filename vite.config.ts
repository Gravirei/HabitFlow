/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: 'localhost', // Restrict to localhost only — prevents LAN exposure during development
    port: 3000,
    open: false,
  },
  build: {
    outDir: 'dist',
    // 'hidden' generates source maps for Sentry error tracking but does NOT
    // serve them publicly — browsers/attackers cannot access your source code.
    // Use 'false' if you don't use Sentry. Never use 'true' in production.
    sourcemap: 'hidden',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    exclude: ['**/node_modules/**', 'e2e/**'],
    testTimeout: 15000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'clover'],
      // Barrel files and entry points are excluded — they're consumed
      // transitively and add no signal to coverage.
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/__tests__/**',
        'src/**/*.test.{ts,tsx}',
        'src/**/__mocks__/**',
        'src/main.tsx',
        'src/test/**',
        'src/**/index.ts',
      ],
      // Thresholds are deferred to Phase 6. The plan (R6) targeted 50%
      // start / 70% goal on the typed core (lib, store, schemas, utils),
      // but the current baseline (~23% lib, ~34% store/utils) and the
      // pre-existing test failures (3 files / 5 tests per AGENTS.md known
      // red baseline) mean vitest 4 suppresses the threshold check
      // entirely. The report is still emitted as a CI artifact so the
      // numbers are visible; the actual gate lands once the test
      // infrastructure is fixed.
    },
  },
})
