require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const createTestUser = async () => {
  try {
    // Connexion à la base de données
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Vérifier si l'utilisateur existe déjà
    let user = await User.findOne({ email: 'test@example.com' });
    
    if (!user) {
      // Créer un mot de passe hashé
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);

      // Créer l'utilisateur
      user = new User({
        nom: 'Test',
        prenom: 'Utilisateur',
        email: 'test@example.com',
        telephone: '771234567',
        password: hashedPassword,
        isVerified: true, // Marquer comme vérifié pour éviter la vérification par OTP
        role: 'admin' // Si votre application a des rôles
      });

      await user.save();
      console.log('✅ Utilisateur de test créé avec succès !');
      console.log('Email: test@example.com');
      console.log('Mot de passe: password123');
    } else {
      console.log('ℹ️ Un utilisateur avec cet email existe déjà');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'utilisateur de test:', error);
    process.exit(1);
  }
};

createTestUser();
