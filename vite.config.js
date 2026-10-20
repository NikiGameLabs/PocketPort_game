import { defineConfig } from 'vite';
import playgamaBridge from '@playgama/bridge/vite';

export default defineConfig({
  base: './',
  plugins: [playgamaBridge()],
  build: {
    target: 'esnext',
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 2000,
  },
  server: {
    port: 5174,
    host: true,
  }
});
