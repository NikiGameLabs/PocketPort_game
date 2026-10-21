import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  base: './',
  plugins: [viteSingleFile()],
  build: {
    target: 'esnext',
    assetsInlineLimit: 10000000,
    chunkSizeWarningLimit: 5000,
  },
  server: {
    port: 5174,
    host: true,
  }
});
