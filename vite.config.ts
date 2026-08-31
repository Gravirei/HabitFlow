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
    rollupOptions: {
      output: {
        manualChunks: {
          // framer-motion is imported by 100+ files including the shell —
          // isolating it keeps app-code deploys from invalidating its cache entry
          'framer-motion': ['framer-motion'],
        },
      },
    },
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
      // Per-layer coverage thresholds. Floor at the actual measured
      // baseline (with a small headroom buffer) so the gate is a
      // regression-detector, not a target. The plan (R6) targets 70%
      // on the typed core as the long-term goal; ramp in a follow-up
      // as the features burn-down (PRs 3-5) adds test coverage.
      //
      // Baseline measured on feat/phase-2-env-errors-runtime after the
      // 3 broken test files were fixed (Categories.templates timeout,
      // axe-audit concurrency, perf benchmark threshold). See PR #9.
      thresholds: {
        'src/lib/**':     { lines: 30, branches: 20, functions: 35, statements: 30 },
        'src/store/**':   { lines: 30, branches: 20, functions: 30, statements: 30 },
        'src/schemas/**': { lines: 90, branches: 90, functions: 90, statements: 90 },
        'src/utils/**':   { lines: 30, branches: 20, functions: 30, statements: 30 },
      },
    },
  },
})
