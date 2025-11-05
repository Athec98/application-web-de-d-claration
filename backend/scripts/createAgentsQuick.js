require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const createAgentsQuick = async () => {
  try {
    console.log('🔗 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/civile-app');
    console.log('✅ Connecté à MongoDB\n');

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

    for (const agentData of agents) {
      try {
        let user = await User.findOne({ email: agentData.email });
        
        if (!user) {
          user = new User({
            firstName: agentData.firstName,
            lastName: agentData.lastName,
            name: agentData.name,
            email: agentData.email,
            phone: agentData.phone,
            isVerified: true,
            role: agentData.role
          });
          await user.setPassword(agentData.password);
          await user.save();
          console.log(`✅ ${agentData.name} créé`);
        } else {
          if (user.role !== agentData.role) {
            user.role = agentData.role;
            await user.setPassword(agentData.password);
            await user.save();
            console.log(`✅ ${agentData.name} mis à jour`);
          } else {
            console.log(`ℹ️  ${agentData.name} existe déjà`);
          }
        }
      } catch (error) {
        console.error(`❌ Erreur pour ${agentData.name}:`, error.message);
      }
    }

    console.log('\n📋 COMPTES DISPONIBLES:');
    console.log('🏛️  Mairie: agent.mairie@etatcivil.sn / Mairie2024!');
    console.log('🏥 Hôpital: agent.hopital@etatcivil.sn / Hopital2024!');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
};

createAgentsQuick();

