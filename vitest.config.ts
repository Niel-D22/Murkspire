import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    // The data layer reads import.meta.env at module scope.
    env: { VITE_HELIUS_API_KEY: 'test-key' },
  },
});
