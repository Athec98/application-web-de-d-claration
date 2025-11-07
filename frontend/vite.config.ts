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
  server: {
    port: 3000,
    host: '0.0.0.0',
    strictPort: true,
    open: true,
    // Désactiver le HMR quand on utilise vite-dev-server.js
    // Réactiver avec hmr: { port: 3000 } si vous utilisez directement 'vite' au lieu de vite-dev-server.js
    hmr: false,
    watch: {
      usePolling: false
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        // Ne pas réécrire - garder /api pour correspondre aux routes backend
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        // Ne pas réécrire - garder /uploads pour correspondre au serveur statique
      },
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Ignorer les erreurs TypeScript pendant le build
    rollupOptions: {
      onwarn(warning, warn) {
        // Ignorer les warnings de dépendances non résolues
        if (warning.code === 'UNRESOLVED_IMPORT') return;
        if (warning.code === 'CIRCULAR_DEPENDENCY') return;
        warn(warning);
      },
    },
    // Continuer le build même avec des erreurs
    minify: 'esbuild',
    target: 'esnext',
  },
});