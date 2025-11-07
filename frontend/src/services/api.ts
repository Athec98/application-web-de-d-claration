import axios from 'axios';

// URL de l'API - Utilise la variable d'environnement ou l'URL de production par défaut
// En production (Vercel), utiliser toujours l'URL complète du backend Render
const getAPIURL = () => {
  // Priorité 1: Variable d'environnement
  if (import.meta.env.VITE_API_URL) {
    console.log('🌐 API URL depuis VITE_API_URL:', import.meta.env.VITE_API_URL);
    return import.meta.env.VITE_API_URL;
  }
  
  // Priorité 2: Détection automatique de Vercel
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // Détecter Vercel (vercel.app) ou tout autre domaine de production
    if (hostname.includes('vercel.app') || hostname.includes('vercel.com')) {
      const prodUrl = 'https://application-web-de-d-claration.onrender.com/api';
      console.log('🌐 API URL détectée (Vercel):', prodUrl);
      return prodUrl;
    }
    // Détecter si on est en production (pas localhost)
    if (hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.includes('192.168.')) {
      const prodUrl = 'https://application-web-de-d-claration.onrender.com/api';
      console.log('🌐 API URL détectée (production):', prodUrl);
      return prodUrl;
    }
  }
  
  // Développement local: utiliser /api (sera proxifié par Vite)
  console.log('🌐 API URL (développement local): /api');
  return '/api';
};

const API_URL = getAPIURL();

// Configuration axios avec token
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token
api.interceptors.request.use(
  (config) => {
    // Essayer d'abord 'token', puis 'auth_token'
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Si c'est un FormData, ne pas définir Content-Type (le navigateur le fera avec le boundary)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

