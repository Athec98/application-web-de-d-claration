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
    const response = await axios.post(`${API_URL}/register`, userData);
    return response.data;
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
    const response = await axios.post(`${API_URL}/login`, { email, password });
    return response.data;
  },
  
  async resendOtp(userId: string) {
    const response = await axios.post(`${API_URL}/resend-otp`, { userId });
    return response.data;
  }
};
