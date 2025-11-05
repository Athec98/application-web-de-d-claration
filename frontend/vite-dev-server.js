import { createServer } from 'vite';
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Obtenir __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Importer ip de manière dynamique (module ESM)
const { default: ip } = await import('ip');

async function startServer() {
  const app = express();
  const port = 3000;
  
  // Créer le serveur Vite en mode middleware
  // Désactiver le HMR pour éviter les problèmes de port
  const vite = await createServer({
    server: { 
      middlewareMode: true,
      hmr: false // Désactiver HMR pour éviter le port 24678
    },
    appType: 'spa',
    configFile: path.resolve(__dirname, 'vite.config.ts'),
    // Forcer la désactivation du HMR même si configFile le définit
    define: {
      __VITE_IS_MODERN_BROWSER__: true
    }
  });

  // Utiliser le middleware Vite
  app.use(vite.middlewares);

  // Configuration du proxy pour les requêtes API
  // Le backend écoute sur le port 5001 (vérifié via netstat)
  app.use('/api', createProxyMiddleware({
    target: 'http://localhost:5001',
    changeOrigin: true,
    secure: false,
    // Ne pas réécrire le chemin - garder /api dans l'URL
    logLevel: 'debug',
    onProxyReq: (proxyReq, req, res) => {
      console.log(`[PROXY] ${req.method} ${req.url} -> http://localhost:5001${req.url}`);
    },
    onError: (err, req, res) => {
      console.error('[PROXY ERROR]', err.message);
      res.status(500).json({ error: 'Erreur de proxy' });
    }
  }));

  // Gérer le rafraîchissement de page pour le routage côté client
  app.use('*', async (req, res, next) => {
    const url = req.originalUrl;
    
    try {
      // Vérifier si le fichier demandé existe dans le dossier public
      const filePath = path.join(__dirname, 'dist', url === '/' ? 'index.html' : url);
      
      if (fs.existsSync(filePath) && !filePath.endsWith('.html')) {
        // Si le fichier existe et n'est pas un fichier HTML, le servir directement
        res.sendFile(filePath);
      } else {
        // Sinon, renvoyer index.html pour le routage côté client
        const html = await vite.transformIndexHtml(
          url,
          fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8')
        );
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      }
    } catch (e) {
      // Si une erreur se produit, laisser Vite gérer le rechargement à chaud
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });

  // Démarrer le serveur Express
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`
  🚀 Serveur de développement démarré sur:
  - Local:   http://localhost:${port}
  - Network: http://${ip.address()}:${port}
`);
  });
}

startServer().catch((err) => {
  console.error('Erreur lors du démarrage du serveur:', err);
  process.exit(1);
});
