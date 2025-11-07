import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Ignorer les erreurs TypeScript pendant le build
    rollupOptions: {
      onwarn(warning, warn) {
        // Ignorer toutes les warnings
        if (warning.code === 'UNRESOLVED_IMPORT') return;
        warn(warning);
      },
    },
  },
  // Désactiver la vérification TypeScript pendant le build
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  },
});

