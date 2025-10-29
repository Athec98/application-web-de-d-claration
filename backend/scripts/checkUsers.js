const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

async function checkUsers() {
  try {
    // Connexion à la base de données
    console.log('Connexion à la base de données...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connecté à la base de données');

    // Importer le modèle User
    const User = require('../models/User');
    
    // Lister tous les utilisateurs
    console.log('\nListe des utilisateurs :');
    const users = await User.find({}).select('-passwordHash');
    
    if (users.length === 0) {
      console.log('Aucun utilisateur trouvé dans la base de données.');
    } else {
      console.log(`\n${users.length} utilisateur(s) trouvé(s) :`);
      users.forEach((user, index) => {
        console.log(`\nUtilisateur #${index + 1}:`);
        console.log(`- ID: ${user._id}`);
        console.log(`- Nom: ${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || 'Non défini');
        console.log(`- Email: ${user.email}`);
        console.log(`- Téléphone: ${user.phone || 'Non défini'}`);
        console.log(`- Rôle: ${user.role || 'parent'}`);
        console.log(`- Vérifié: ${user.isVerified ? 'Oui' : 'Non'}`);
        console.log(`- Date de création: ${user.createdAt}`);
      });
    }

    // Vérifier un utilisateur spécifique
    if (users.length > 0) {
      const testUser = users[0];
      console.log('\nTest de connexion pour l\'utilisateur:', testUser.email);
      
      const userWithPassword = await User.findById(testUser._id).select('+passwordHash');
      if (userWithPassword) {
        console.log('Mot de passe haché présent:', userWithPassword.passwordHash ? 'Oui' : 'Non');
        
        // Tester un mot de passe incorrect
        const isMatch = await userWithPassword.matchPassword('motdepasseincorrect');
        console.log('Test avec mot de passe incorrect:', isMatch ? '✅ Réussi (ce qui est anormal)' : '❌ Échec (comportement attendu)');
        
        // Tester le bon mot de passe (si disponible)
        if (process.env.TEST_PASSWORD) {
          const isMatchCorrect = await userWithPassword.matchPassword(process.env.TEST_PASSWORD);
          console.log('Test avec mot de passe correct:', isMatchCorrect ? '✅ Réussi' : '❌ Échec');
        }
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

checkUsers();
