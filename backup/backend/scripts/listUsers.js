require('dotenv').config();
const mongoose = require('mongoose');

async function listUsers() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connecté à MongoDB');
    
    // Récupérer le modèle User
    const User = require('../models/User');
    
    // Récupérer tous les utilisateurs (sans le mot de passe)
    const users = await User.find().select('-password');
    
    console.log('\n📋 Liste des utilisateurs :');
    console.log(JSON.stringify(users, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur :', error);
    process.exit(1);
  }
}

listUsers();
