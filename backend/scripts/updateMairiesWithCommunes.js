require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Mairie = require('../models/Mairie');
const Departement = require('../models/Departement');
const Commune = require('../models/Commune');

async function updateMairiesWithCommunes() {
  try {
    console.log('🔗 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    console.log('📝 Mise à jour des mairies avec les communes...\n');

    // Récupérer toutes les mairies
    const mairies = await Mairie.find({});
    console.log(`📊 ${mairies.length} mairie(s) trouvée(s)\n`);

    let updatedCount = 0;

    for (const mairie of mairies) {
      // Trouver la commune correspondante au département de la mairie
      const commune = await Commune.findOne({ 
        departement: mairie.departement,
        active: true 
      });

      if (commune && (!mairie.commune || mairie.commune.toString() !== commune._id.toString())) {
        mairie.commune = commune._id;
        await mairie.save();
        console.log(`✅ Mairie "${mairie.nom}" mise à jour avec la commune "${commune.nom}"`);
        updatedCount++;
      } else if (!commune) {
        console.log(`⚠️  Aucune commune trouvée pour la mairie "${mairie.nom}"`);
      } else {
        console.log(`ℹ️  Mairie "${mairie.nom}" est déjà à jour`);
      }
    }

    console.log(`\n✅ Mise à jour terminée ! ${updatedCount} mairie(s) mise(s) à jour.\n`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error);
    process.exit(1);
  }
}

updateMairiesWithCommunes();

