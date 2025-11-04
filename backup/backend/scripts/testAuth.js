const axios = require('axios');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const API_URL = 'http://localhost:5000/api/auth';

async function testAuth() {
  try {
    // Test 1: Tentative de connexion avec des identifiants incorrects
    console.log('Test 1: Tentative de connexion avec des identifiants incorrects');
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email: 'email_inexistant@example.com',
        password: 'faux_mot_de_passe'
      });
      console.log('❌ ÉCHEC: La connexion a réussi avec des identifiants incorrects');
      console.log('Réponse:', response.data);
    } catch (error) {
      if (error.response) {
        console.log(`✅ SUCCÈS: La connexion a échoué comme prévu avec le statut ${error.response.status}`);
        console.log('Message d\'erreur:', error.response.data.message || error.response.data);
      } else {
        console.error('❌ ERREUR:', error.message);
      }
    }

    // Test 2: Vérifier la réponse avec un email valide mais un mot de passe incorrect
    console.log('\nTest 2: Tentative de connexion avec un email valide mais un mot de passe incorrect');
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email: 'test@example.com',
        password: 'mot_de_passe_incorrect'
      });
      console.log('❌ ÉCHEC: La connexion a réussi avec un mot de passe incorrect');
      console.log('Réponse:', response.data);
    } catch (error) {
      if (error.response) {
        console.log(`✅ SUCCÈS: La connexion a échoué comme prévu avec le statut ${error.response.status}`);
        console.log('Message d\'erreur:', error.response.data.message || error.response.data);
      } else {
        console.error('❌ ERREUR:', error.message);
      }
    }

    // Test 3: Tester avec un utilisateur existant mais non vérifié
    console.log('\nTest 3: Tentative de connexion avec un compte non vérifié');
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email: 'assane@gmail.com',
        password: 'votre_mot_de_passe'  // Remplacez par le mot de passe correct si nécessaire
      });
      
      if (response.data.requiresVerification) {
        console.log('✅ SUCCÈS: Le système a détecté que le compte nécessite une vérification');
        console.log('Réponse:', response.data);
      } else {
        console.log('❌ ATTENTION: Le système a permis la connexion à un compte non vérifié');
        console.log('Réponse:', response.data);
      }
    } catch (error) {
      if (error.response) {
        console.log(`✅ SUCCÈS: La connexion a échoué avec le statut ${error.response.status}`);
        console.log('Message d\'erreur:', error.response.data.message || error.response.data);
      } else {
        console.error('❌ ERREUR:', error.message);
      }
    }

  } catch (error) {
    console.error('❌ ERREUR LORS DU TEST:', error);
  } finally {
    process.exit(0);
  }
}

testAuth();
