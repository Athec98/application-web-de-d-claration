// Constantes partagées pour l'application
export const COOKIE_NAME = 'auth_token';
export const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000; // 1 an en millisecondes

export const UNAUTHED_ERR_MSG = 'Non authentifié. Veuillez vous connecter.';

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

export const API_URL = getAPIURL();

export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  HOPITAL: 'hopital',
  MAIRIE: 'mairie',
  PARENT: 'parent'
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  DECLARATION: '/declaration',
  NEW_DECLARATION: '/declaration/nouvelle',
  EDIT_DECLARATION: '/declaration/editer/'
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    VERIFY_OTP: '/api/auth/verify-otp',
    RESEND_OTP: '/api/auth/resend-otp',
    PROFILE: '/api/auth/profile'
  },
  DECLARATIONS: {
    BASE: '/api/declarations',
    BY_USER: '/api/declarations/user',
    VERIFY: '/api/declarations/verify',
    STATS: '/api/declarations/stats'
  }
};

export const LOCAL_STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  THEME: 'theme'
};
