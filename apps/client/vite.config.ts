import { defineConfig } from 'vite';

export default defineConfig({
  server: { fs: { allow: ['../..'] } },
  worker: { format: 'es' },
  build: {
    // Inline the sim's wasm so the worker needs no extra fetch and the game
    // can be packed into a single HTML file (see scripts/single-file.mjs).
    assetsInlineLimit: (file) => (file.endsWith('.wasm') || file.includes('/art/') ? true : undefined),
  },
});
