const axios = require('axios');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const API_URL = 'http://localhost:5000/api/auth';

async function testLogin() {
  try {
    // Test 1: Tentative de connexion avec un email qui n'existe pas
    console.log('Test 1: Tentative de connexion avec un email qui n\'existe pas');
    try {
      await axios.post(`${API_URL}/login`, {
        email: 'inexistant@example.com',
        password: 'motdepasse123'
      });
      console.log('❌ ÉCHEC: La connexion a réussi avec un email qui n\'existe pas');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ SUCCÈS: La connexion a échoué comme prévu pour un email qui n\'existe pas');
      } else {
        console.error('❌ ERREUR INATTENDUE:', error.message);
      }
    }

    // Test 2: Tentative de connexion avec un mot de passe incorrect
    console.log('\nTest 2: Tentative de connexion avec un mot de passe incorrect');
    try {
      await axios.post(`${API_URL}/login`, {
        email: 'test@example.com',
        password: 'motdepasse_incorrect'
      });
      console.log('❌ ÉCHEC: La connexion a réussi avec un mot de passe incorrect');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ SUCCÈS: La connexion a échoué comme prévu avec un mot de passe incorrect');
      } else {
        console.error('❌ ERREUR INATTENDUE:', error.message);
      }
    }

    // Test 3: Tentative de connexion avec des identifiants valides
    console.log('\nTest 3: Tentative de connexion avec des identifiants valides');
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email: 'test@example.com',
        password: 'Test123!' // Remplacez par un mot de passe valide si nécessaire
      });
      
      if (response.data && response.data.token) {
        console.log('✅ SUCCÈS: Connexion réussie avec des identifiants valides');
        console.log('Token JWT reçu:', response.data.token.substring(0, 20) + '...');
      } else {
        console.log('❌ ÉCHEC: La connexion a échoué avec des identifiants valides');
      }
    } catch (error) {
      console.error('❌ ERREUR LORS DE LA CONNEXION AVEC DES IDENTIFIANTS VALIDES:', error.message);
      if (error.response) {
        console.error('Détails de l\'erreur:', error.response.data);
      }
    }

  } catch (error) {
    console.error('❌ ERREUR LORS DU TEST:', error);
  }
}

testLogin();
