require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const path = require('path');
const fs = require('fs');

// Connexion à la base de données
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Créer le dossier uploads s'il n'existe pas
const uploadsDir = path.join(__dirname, 'uploads', 'documents');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Servir les fichiers statiques (documents uploadés)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/declarations', require('./routes/declarationRoutes'));

// Route de test
app.get('/', (req, res) => {
  res.json({
    message: '🇸🇳 API État Civil Sénégal',
    version: '1.0.0',
    status: 'active'
  });
});

// Middleware de gestion des erreurs (doit être en dernier)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}\n`);
});

// Gestion des erreurs non capturées
process.on('unhandledRejection', (err) => {
  console.log('❌ Erreur non gérée:', err.message);
  process.exit(1);
});
