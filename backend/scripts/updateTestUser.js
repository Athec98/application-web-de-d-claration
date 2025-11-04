require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const updateTestUser = async () => {
  try {
    // Connexion à la base de données
    await mongoose.connect(process.env.MONGODB_URI);

    // Trouver l'utilisateur de test
    const user = await User.findOne({ email: 'test@example.com' });
    
    if (user) {
      // Mettre à jour le mot de passe
      await user.setPassword('Test123!');
      user.isVerified = true;
      await user.save();
      
      console.log('✅ Mot de passe de l\'utilisateur de test mis à jour avec succès !');
      console.log('Email: test@example.com');
      console.log('Nouveau mot de passe: Test123!');
    } else {
      console.log('ℹ️ Aucun utilisateur trouvé avec l\'email test@example.com');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour de l\'utilisateur de test:', error);
    process.exit(1);
  }
};

updateTestUser();
