const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const User = require('../models/User');

async function debugAuth() {
  try {
    console.log('Connexion à la base de données...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connecté à la base de données');

    // Test 1: Vérifier les utilisateurs dans la base de données
    console.log('\n=== Liste des utilisateurs ===');
    const users = await User.find({}).select('+passwordHash');
    
    if (users.length === 0) {
      console.log('Aucun utilisateur trouvé dans la base de données.');
      return;
    }

    // Afficher les informations de chaque utilisateur
    users.forEach((user, index) => {
      console.log(`\nUtilisateur #${index + 1}:`);
      console.log(`- ID: ${user._id}`);
      console.log(`- Email: ${user.email}`);
      console.log(`- Mot de passe haché: ${user.passwordHash ? 'Oui' : 'Non'}`);
      console.log(`- Vérifié: ${user.isVerified ? 'Oui' : 'Non'}`);
      console.log(`- Rôle: ${user.role}`);
    });

    // Test 2: Tester la connexion avec des identifiants incorrects
    console.log('\n=== Test de connexion avec des identifiants incorrects ===');
    const testEmail = 'email_inexistant@example.com';
    const testPassword = 'faux_mot_de_passe';
    
    console.log(`Tentative de connexion avec email: ${testEmail}`);
    const user = await User.findOne({ email: testEmail }).select('+passwordHash');
    
    if (!user) {
      console.log('✅ Aucun utilisateur trouvé avec cet email (comportement attendu)');
    } else {
      console.log('❌ Un utilisateur a été trouvé avec cet email (comportement inattendu)');
      console.log('Détails de l\'utilisateur trouvé:', {
        _id: user._id,
        email: user.email,
        hasPassword: !!user.passwordHash,
        isVerified: user.isVerified
      });
    }

    // Test 3: Tester la connexion avec un email existant mais un mot de passe incorrect
    if (users.length > 0) {
      const existingUser = users[0];
      console.log(`\n=== Test de connexion avec l'utilisateur existant: ${existingUser.email} ===`);
      
      // Tester avec un mauvais mot de passe
      const wrongPassword = 'mauvais_mot_de_passe';
      console.log(`Tentative de connexion avec un mauvais mot de passe`);
      
      try {
        const isMatch = await existingUser.matchPassword(wrongPassword);
        if (!isMatch) {
          console.log('✅ Le mot de passe incorrect a été rejeté (comportement attendu)');
        } else {
          console.log('❌ Le mot de passe incorrect a été accepté (comportement inattendu)');
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du mot de passe:', error);
      }
      
      // Tester avec un mot de passe vide
      console.log('\nTest avec un mot de passe vide');
      try {
        const isMatch = await existingUser.matchPassword('');
        if (!isMatch) {
          console.log('✅ Le mot de passe vide a été rejeté (comportement attendu)');
        } else {
          console.log('❌ Le mot de passe vide a été accepté (comportement inattendu)');
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du mot de passe vide:', error);
      }
    }

  } catch (error) {
    console.error('Erreur lors du débogage:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDéconnexion de la base de données');
  }
}

debugAuth();
