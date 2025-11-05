require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const createAgentHopital = async () => {
  try {
    console.log('🔗 Connexion à la base de données...');
    // Connexion à la base de données
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connecté à MongoDB');

    // Informations de l'agent hôpital
    const agentEmail = 'agent.hopital@etatcivil.sn';
    const agentPassword = 'Hopital2024!';
    
    // Vérifier si l'utilisateur existe déjà
    let user = await User.findOne({ email: agentEmail });
    
    if (!user) {
      // Créer l'agent hôpital
      user = new User({
        firstName: 'Agent',
        lastName: 'Hôpital',
        name: 'Agent Hôpital',
        email: agentEmail,
        phone: '+221 77 000 00 02',
        isVerified: true, // Marquer comme vérifié pour éviter la vérification par OTP
        role: 'hopital' // Rôle hôpital
      });

      // Définir le mot de passe (sera haché par le middleware pre-save)
      await user.setPassword(agentPassword);
      
      // Sauvegarder l'utilisateur
      await user.save();
      
      console.log('\n✅ Agent Hôpital créé avec succès !');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 Email:', agentEmail);
      console.log('🔑 Mot de passe:', agentPassword);
      console.log('👤 Rôle: Hôpital');
      console.log('✅ Statut: Vérifié (connexion directe possible)');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    } else {
      console.log('⚠️  Un utilisateur avec cet email existe déjà');
      console.log('📧 Email existant:', agentEmail);
      console.log('👤 Rôle:', user.role);
      console.log('✅ Statut:', user.isVerified ? 'Vérifié' : 'Non vérifié');
      
      // Mettre à jour le mot de passe si nécessaire
      if (user.role !== 'hopital') {
        user.role = 'hopital';
        await user.setPassword(agentPassword);
        await user.save();
        console.log('✅ Rôle mis à jour vers "hopital"');
        console.log('✅ Mot de passe mis à jour');
      }
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'agent hôpital:', error);
    process.exit(1);
  }
};

createAgentHopital();


