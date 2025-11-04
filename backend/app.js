const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/database'); // fonction pour connecter MongoDB
const { auditLogger } = require('./middleware/auditLog');
const authRoutes = require('./routes/authRoutes');

// Configuration de l'environnement
dotenv.config();

// Connexion à la base de données
connectDB();

// Création de l'application Express
const app = express();

// Middleware pour parser le JSON
app.use(express.json());

// Middleware de journalisation des accès
app.use(auditLogger);

// Routes d'authentification
app.use('/api/auth', authRoutes);

// Test route
app.get('/', (req, res) => res.send('API is running'));

const DEFAULT_PORT = 5000;
const MAX_PORT_ATTEMPTS = 5;
const envPort = Number(process.env.PORT);
const initialPort = Number.isFinite(envPort) && envPort > 0 ? envPort : DEFAULT_PORT;

const startServer = (port, attempt = 0) => {
  const server = app.listen(port, () => console.log(`Server running on port ${port}`));

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      if (attempt < MAX_PORT_ATTEMPTS) {
        const nextPort = attempt === 0 && port !== DEFAULT_PORT ? DEFAULT_PORT : port + 1;
        console.warn(`⚠️  Le port ${port} est déjà utilisé. Tentative sur le port ${nextPort}...`);
        startServer(nextPort, attempt + 1);
        return;
      }

      console.error(`❌ Impossible de démarrer le serveur après ${MAX_PORT_ATTEMPTS + 1} tentatives. Dernier port testé: ${port}.`);
      console.error("Arrêtez les processus en cours d'exécution ou définissez la variable d'environnement PORT avec une valeur disponible.");
      process.exit(1);
    } else {
      console.error('❌ Erreur lors du démarrage du serveur Express:', error);
      process.exit(1);
    }
  });
};

startServer(initialPort);
