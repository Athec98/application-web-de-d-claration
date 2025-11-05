const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const connectDB = require('./config/database'); // fonction pour connecter MongoDB
const { auditLogger } = require('./middleware/auditLog');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const declarationRoutes = require('./routes/declarationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const geographicRoutes = require('./routes/geographicRoutes');
const mairieRoutes = require('./routes/mairieRoutes');
const acteNaissanceRoutes = require('./routes/acteNaissanceRoutes');

// Configuration de l'environnement
dotenv.config();

// Connexion à la base de données (ne bloque pas le démarrage du serveur)
connectDB().catch((err) => {
  console.error('⚠️  Erreur de connexion MongoDB, mais le serveur continue de fonctionner');
  console.error('   Vérifiez votre configuration MongoDB et votre whitelist IP');
});

// Création de l'application Express
const app = express();

// Configuration CORS
const corsOptions = {
  origin: (origin, callback) => {
    // Autoriser les requêtes sans origine (comme les applications mobiles ou Postman)
    if (!origin) return callback(null, true);
    
    // Liste des origines autorisées
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ];
    
    // Vérifier si l'origine est dans la liste
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    
    // En développement, autoriser toutes les adresses IP locales et localhost
    if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
      // Pattern pour localhost, 127.0.0.1, et toutes les adresses IP privées (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
      const localPattern = /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2[0-9]|3[01])\.\d{1,3}\.\d{1,3}):\d+$/;
      
      if (localPattern.test(origin)) {
        console.log(`✅ Origine autorisée: ${origin}`);
        return callback(null, true);
      }
    }
    
    // Si l'origine n'est pas autorisée
    const msg = `L'origine ${origin} n'est pas autorisée par CORS`;
    console.warn(msg);
    return callback(new Error(msg), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // Mise en cache des pré-vérifications CORS pendant 24 heures
};

// Middleware CORS
app.use(cors(corsOptions));

// Gestion des requêtes OPTIONS (pré-vol CORS)
app.options('*', cors(corsOptions));

// Middleware pour parser le JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware de journalisation des accès
app.use(auditLogger);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/declarations', declarationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/geographic', geographicRoutes);
app.use('/api/mairies', mairieRoutes);
app.use('/api/actes-naissance', acteNaissanceRoutes);

// Test route
app.get('/', (req, res) => res.json({
  message: '🇸🇳 API État Civil Sénégal',
  version: '1.0.0',
  status: 'active'
}));

// Middleware de gestion des erreurs (doit être en dernier)
app.use(errorHandler);

// Port du serveur - utiliser 5000 par défaut pour correspondre au proxy
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
