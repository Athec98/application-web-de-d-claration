import { COOKIE_NAME, ONE_YEAR_MS } from './shared/const';

export { COOKIE_NAME, ONE_YEAR_MS };

export const APP_TITLE = 'État Civil Sénégal';

export const APP_LOGO = '/public/armoiries-senegal.png';

// Générer l'URL de connexion en fonction de l'origine actuelle
export const getLoginUrl = () => {
  // Utilisation d'une URL par défaut si les variables d'environnement ne sont pas définies
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL || 'http://localhost:5000';
  const appId = import.meta.env.VITE_APP_ID || 'default-app-id';
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  try {
    const url = new URL(`${oauthPortalUrl}/app-auth`);
    url.searchParams.set("appId", appId);
    url.searchParams.set("redirectUri", redirectUri);
    url.searchParams.set("state", state);
    url.searchParams.set("type", "signIn");
    return url.toString();
  } catch (error) {
    console.error('Erreur lors de la création de l\'URL de connexion :', error);
    return '#';
  }
};