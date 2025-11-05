require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const createAgents = async () => {
  try {
    console.log('🔗 Connexion à la base de données...');
    // Connexion à la base de données
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connecté à MongoDB\n');

    // Agents à créer
    const agents = [
      {
        email: 'agent.mairie@etatcivil.sn',
        password: 'Mairie2024!',
        firstName: 'Agent',
        lastName: 'Mairie',
        name: 'Agent Mairie',
        phone: '+221 77 000 00 01',
        role: 'mairie'
      },
      {
        email: 'agent.hopital@etatcivil.sn',
        password: 'Hopital2024!',
        firstName: 'Agent',
        lastName: 'Hôpital',
        name: 'Agent Hôpital',
        phone: '+221 77 000 00 02',
        role: 'hopital'
      }
    ];

    console.log('📝 Création des comptes agents...\n');

    for (const agentData of agents) {
      try {
        // Vérifier si l'utilisateur existe déjà
        let user = await User.findOne({ email: agentData.email });
        
        if (!user) {
          // Créer l'agent
          user = new User({
            firstName: agentData.firstName,
            lastName: agentData.lastName,
            name: agentData.name,
            email: agentData.email,
            phone: agentData.phone,
            isVerified: true, // Marquer comme vérifié pour éviter la vérification par OTP
            role: agentData.role
          });

          // Définir le mot de passe
          await user.setPassword(agentData.password);
          
          // Sauvegarder l'utilisateur
          await user.save();
          
          console.log(`✅ ${agentData.name} créé avec succès !`);
          console.log(`   📧 Email: ${agentData.email}`);
          console.log(`   🔑 Mot de passe: ${agentData.password}`);
          console.log(`   👤 Rôle: ${agentData.role}`);
          console.log(`   ✅ Statut: Vérifié\n`);
        } else {
          console.log(`⚠️  ${agentData.name} existe déjà`);
          console.log(`   📧 Email: ${agentData.email}`);
          console.log(`   👤 Rôle actuel: ${user.role}`);
          
          // Mettre à jour si le rôle est incorrect
          if (user.role !== agentData.role) {
            user.role = agentData.role;
            await user.setPassword(agentData.password);
            await user.save();
            console.log(`   ✅ Rôle mis à jour vers "${agentData.role}"`);
            console.log(`   ✅ Mot de passe mis à jour\n`);
          } else {
            console.log(`   ℹ️  Aucune modification nécessaire\n`);
          }
        }
      } catch (error) {
        console.error(`❌ Erreur lors de la création de ${agentData.name}:`, error.message);
      }
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 RÉSUMÉ DES COMPTES AGENTS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🏛️  AGENT MAIRIE');
    console.log('   Email: agent.mairie@etatcivil.sn');
    console.log('   Mot de passe: Mairie2024!');
    console.log('   URL: http://localhost:3000/login');
    console.log('\n🏥 AGENT HÔPITAL');
    console.log('   Email: agent.hopital@etatcivil.sn');
    console.log('   Mot de passe: Hopital2024!');
    console.log('   URL: http://localhost:3000/login');
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la création des agents:', error);
    process.exit(1);
  }
};

createAgents();


