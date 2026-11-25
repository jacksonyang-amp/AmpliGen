import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const entry = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  base: '/AmpliGen/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      input: {
        main: entry('./index.html'),
        product: entry('./product/index.html'),
        pricing: entry('./pricing/index.html'),
        'demo-request': entry('./demo-request/index.html'),
        'sign-up': entry('./sign-up/index.html'),
      },
    },
  },
});
