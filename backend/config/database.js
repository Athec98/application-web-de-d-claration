const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

let usingFallbackUri = false;

console.log('Chargement de la configuration MongoDB...');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'définie' : 'non définie');

if (!process.env.MONGODB_URI) {
  const fallbackUri = 'mongodb://127.0.0.1:27017/civile-app';

  if (process.env.NODE_ENV === 'production') {
    console.error('❌ Erreur: MONGODB_URI n\'est pas définie dans les variables d\'environnement');
    process.exit(1);
  }

  console.warn('⚠️  MONGODB_URI non définie. Utilisation d\'une instance locale de MongoDB:', fallbackUri);
  process.env.MONGODB_URI = fallbackUri;
  usingFallbackUri = true;
}

// Configuration de la connexion MongoDB
const mongoOptions = {
  serverSelectionTimeoutMS: 5000, // Timeout après 5 secondes au lieu de 30 secondes par défaut
  socketTimeoutMS: 45000, // Fermer les sockets après 45 secondes d'inactivité
};

const connectDB = async () => {
  try {
    console.log('Tentative de connexion à MongoDB...');
    
    // Activer le mode debug de Mongoose pour voir les requêtes
    mongoose.set('debug', process.env.NODE_ENV === 'development');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, mongoOptions);
    
    console.log(`✅ MongoDB connecté avec succès à: ${conn.connection.host}`);
    console.log(`📊 Base de données: ${conn.connection.name}`);
    
    // Gestion des événements de connexion
    mongoose.connection.on('connected', () => {
      console.log('Mongoose est connecté à la base de données');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('❌ Erreur de connexion MongoDB:', err.message);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose a été déconnecté de la base de données');
    });
    
    // Gestion de la fermeture du processus Node.js
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('Connexion MongoDB fermée suite à l\'arrêt de l\'application');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Erreur critique de connexion MongoDB:');
    console.error('- Message:', error.message);
    console.error('- Code:', error.code);
    console.error('- Code Name:', error.codeName);
    console.error('- Stack:', error.stack);

    if (usingFallbackUri) {
      console.warn('⚠️  Connexion à l\'instance MongoDB locale impossible. L\'API démarre en mode dégradé sans base de données.');
      return;
    }

    // Sortie avec un code d'erreur pour indiquer un échec
    process.exit(1);
  }
};

module.exports = connectDB;
