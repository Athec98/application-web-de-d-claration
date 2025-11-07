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
const fileRoutes = require('./routes/fileRoutes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

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
    
    // Autoriser tous les domaines Vercel
    if (origin.includes('vercel.app') || origin.includes('vercel.com')) {
      console.log(`✅ Origine Vercel autorisée: ${origin}`);
      return callback(null, true);
    }
    
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
// Important: Servir les fichiers AVANT le middleware auditLogger pour éviter les logs inutiles
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filePath) => {
    // Définir les en-têtes CORS pour les fichiers statiques
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    // Permettre la mise en cache des fichiers
    res.setHeader('Cache-Control', 'public, max-age=31536000');
  }
}));

// Middleware de journalisation des accès
app.use(auditLogger);

// Documentation Swagger
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'CIVILE-APP API Documentation',
  explorer: true,
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true
  }
}));

// Route pour obtenir le JSON Swagger
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/declarations', declarationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/geographic', geographicRoutes);
app.use('/api/mairies', mairieRoutes);
app.use('/api/actes-naissance', acteNaissanceRoutes);
app.use('/api/files', fileRoutes);

// Test route
app.get('/', (req, res) => res.json({
  message: '🇸🇳 API CIVILE-APP',
  version: '1.0.0',
  status: 'active',
  documentation: '/api-docs'
}));

// Middleware de gestion des erreurs (doit être en dernier)
app.use(errorHandler);

// Port du serveur - Render.com définit automatiquement PORT dans les variables d'environnement
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0'; // Écouter sur toutes les interfaces pour être accessible depuis le réseau

app.listen(PORT, HOST, () => {
  console.log(`\n🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📍 URL locale: http://localhost:${PORT}`);
  console.log(`🌐 URL réseau: http://${HOST === '0.0.0.0' ? '192.168.1.25' : HOST}:${PORT}`);
  console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}\n`);
});

// Gestion des erreurs non capturées
process.on('unhandledRejection', (err) => {
  console.log('❌ Erreur non gérée:', err.message);
  process.exit(1);
});
