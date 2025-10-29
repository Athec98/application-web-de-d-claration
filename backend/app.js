require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');

// Import des routes
const authRoutes = require('./routes/authRoutes');
const declarationRoutes = require('./routes/declarationRoutes');

// Import des modèles
require('./models/User');
require('./models/Declaration');

// Initialisation de l'application Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/declarations', declarationRoutes);

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Quelque chose a mal tourné!');
});

// Configuration du port
const PORT = process.env.PORT || 5000;

// Connexion à la base de données
connectDB();

// Démarrer le serveur
const server = app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

// Gestion des erreurs non capturées
process.on('unhandledRejection', (err) => {
  console.error(`Erreur: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app;
