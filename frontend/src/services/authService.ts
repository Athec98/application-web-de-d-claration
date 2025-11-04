import axios from 'axios';

const API_URL = '/api/auth';

interface RegisterData {
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  password: string;
}

export const authService = {
  async register(userData: RegisterData) {
    try {
      console.log('Envoi de la requête d\'inscription:', userData);
      const response = await axios.post(`${API_URL}/register`, userData);
      console.log('Réponse d\'inscription reçue:', response);
      
      // Vérifier si la réponse contient des données
      if (!response || !response.data) {
        throw new Error('Réponse du serveur vide');
      }
      
      // Retourner toute la réponse pour un traitement ultérieur
      return response;
    } catch (error: any) {
      console.error('Erreur lors de l\'inscription:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status
      });
      
      // Propager l'erreur avec plus de détails
      const errorMessage = error?.response?.data?.message || 
                         error?.message || 
                         'Erreur lors de l\'inscription';
      throw new Error(errorMessage);
    }
  },

  async verifyOTP(userId: string, otp: string) {
    try {
      console.log('Envoi de la requête de vérification OTP:', { userId, otp });
      const response = await axios.post(`${API_URL}/verify-otp`, { 
        userId, 
        otp 
      });
      console.log('Réponse de vérification OTP reçue:', response.data);
      return response.data;
    } catch (error: any) {
      const errorInfo = {
        message: error?.message || 'Erreur inconnue',
        response: error?.response?.data,
        status: error?.response?.status
      };
      console.error('Erreur lors de la vérification OTP:', errorInfo);
      throw error;
    }
  },

  async login(email: string, password: string) {
    try {
      const response = await axios.post(`${API_URL}/login`, { 
        email: email.trim().toLowerCase(),
        password: password
      }, {
        timeout: 10000, // 10 secondes de timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data && response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data?.message || 'Réponse invalide du serveur');
      }
    } catch (error: any) {
      console.error('Erreur lors de la connexion:', error);
      
      if (error.response) {
        // Le serveur a répondu avec un code d'erreur
        const { status, data } = error.response;
        
        if (status === 401) {
          throw new Error(data?.message || 'Email ou mot de passe incorrect');
        } else if (status === 403) {
          // Pour la vérification d'email
          const err = new Error(data?.message || 'Veuvez vérifier votre email avant de vous connecter');
          (err as any).requiresVerification = true;
          (err as any).userId = data?.userId;
          throw err;
        } else if (status >= 500) {
          throw new Error('Erreur serveur. Veuillez réessayer plus tard.');
        } else {
          throw new Error(data?.message || 'Erreur de connexion');
        }
      } else if (error.request) {
        // La requête a été faite mais aucune réponse n'a été reçue
        throw new Error('Impossible de se connecter au serveur. Vérifiez votre connexion internet.');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('La connexion a expiré. Veuillez réessayer.');
      } else {
        // Erreur lors de la configuration de la requête
        throw new Error('Erreur de configuration de la requête: ' + error.message);
      }
    }
  },
  
  async resendOtp(userId: string) {
    const response = await axios.post(`${API_URL}/resend-otp`, { userId });
    return response.data;
  }
};
