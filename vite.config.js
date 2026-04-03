import { defineConfig } from 'vite';

export default defineConfig({
  base: '/ai-daily/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  server: {
    open: true,
  },
});
