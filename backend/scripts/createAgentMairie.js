require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const createAgentMairie = async () => {
  try {
    console.log('🔗 Connexion à la base de données...');
    // Connexion à la base de données
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connecté à MongoDB');

    // Informations de l'agent mairie
    const agentEmail = 'agent.mairie@etatcivil.sn';
    const agentPassword = 'Mairie2024!';
    
    // Vérifier si l'utilisateur existe déjà
    let user = await User.findOne({ email: agentEmail });
    
    if (!user) {
      // Créer l'agent mairie
      user = new User({
        firstName: 'Agent',
        lastName: 'Mairie',
        name: 'Agent Mairie',
        email: agentEmail,
        phone: '+221 77 000 00 01',
        isVerified: true, // Marquer comme vérifié pour éviter la vérification par OTP
        role: 'mairie' // Rôle mairie
      });

      // Définir le mot de passe (sera haché par le middleware pre-save)
      await user.setPassword(agentPassword);
      
      // Sauvegarder l'utilisateur
      await user.save();
      
      console.log('\n✅ Agent Mairie créé avec succès !');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 Email:', agentEmail);
      console.log('🔑 Mot de passe:', agentPassword);
      console.log('👤 Rôle: Mairie');
      console.log('✅ Statut: Vérifié (connexion directe possible)');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    } else {
      console.log('⚠️  Un utilisateur avec cet email existe déjà');
      console.log('📧 Email existant:', agentEmail);
      console.log('👤 Rôle:', user.role);
      console.log('✅ Statut:', user.isVerified ? 'Vérifié' : 'Non vérifié');
      
      // Mettre à jour le mot de passe si nécessaire
      if (user.role !== 'mairie') {
        user.role = 'mairie';
        await user.setPassword(agentPassword);
        await user.save();
        console.log('✅ Rôle mis à jour vers "mairie"');
        console.log('✅ Mot de passe mis à jour');
      }
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'agent mairie:', error);
    process.exit(1);
  }
};

createAgentMairie();


