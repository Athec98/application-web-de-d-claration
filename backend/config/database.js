const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

console.log('Chargement de la configuration MongoDB...');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'définie' : 'non définie');

if (!process.env.MONGODB_URI) {
  console.error('❌ Erreur: MONGODB_URI n\'est pas définie dans les variables d\'environnement');
  process.exit(1);
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
    
    // Ne pas faire crasher l'application - permettre au serveur de démarrer
    // L'utilisateur pourra voir l'erreur et corriger la configuration
    console.error('\n⚠️  IMPORTANT: Le serveur continuera de fonctionner, mais les opérations de base de données échoueront.');
    console.error('📝 Pour résoudre ce problème:');
    console.error('   1. Vérifiez votre MONGODB_URI dans le fichier .env');
    console.error('   2. Ajoutez votre IP actuelle à la whitelist MongoDB Atlas:');
    console.error('      https://www.mongodb.com/docs/atlas/security-whitelist/');
    console.error('   3. Ou autorisez toutes les IPs temporairement avec: 0.0.0.0/0 (⚠️ non sécurisé pour la production)');
    
    // Ne pas faire exit - permettre au serveur de démarrer
    // throw error; // Lancer l'erreur pour que le serveur puisse la gérer
  }
};

module.exports = connectDB;
