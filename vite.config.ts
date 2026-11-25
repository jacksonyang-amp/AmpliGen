import { defineConfig } from 'vite';

export default defineConfig({
  base: '/AmpliGen/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
  },
});
