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
    open: true,
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
  },
})
