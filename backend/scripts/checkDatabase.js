const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

async function checkDatabase() {
  try {
    // Connexion à la base de données
    console.log('Connexion à la base de données...');
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connecté à la base de données');

    // Obtenir la liste des collections
    const collections = await conn.connection.db.listCollections().toArray();
    console.log('\nCollections disponibles :');
    collections.forEach(collection => console.log(`- ${collection.name}`));

    // Vérifier la collection des utilisateurs
    const usersCollection = conn.connection.db.collection('users');
    const userCount = await usersCollection.countDocuments();
    console.log(`\nNombre total d'utilisateurs : ${userCount}`);

    // Afficher un échantillon d'utilisateurs
    const sampleUsers = await usersCollection.find({}).limit(2).toArray();
    console.log('\nExemple d\'utilisateur :', JSON.stringify(sampleUsers, null, 2));

    // Vérifier si le champ password est présent
    const userWithPassword = await usersCollection.findOne({ email: 'test@example.com' });
    if (userWithPassword) {
      console.log('\nChamps de l\'utilisateur test@example.com :', Object.keys(userWithPassword));
      console.log('Mot de passe présent :', 'password' in userWithPassword);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

checkDatabase();
