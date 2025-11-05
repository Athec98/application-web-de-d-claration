import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react()],
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
    hmr: {
      port: 3000,
      host: '0.0.0.0',
      clientPort: 3000 // Port utilisé par le client pour se connecter
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
        // Ne pas réécrire - garder /api pour correspondre aux routes backend
      },
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});

