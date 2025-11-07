/**
 * Construit l'URL d'un fichier uploadé
 * Utilise la route API /api/files pour servir les fichiers
 * @param docUrl - URL du document (peut être relative ou absolue)
 * @returns URL vers le fichier via l'API
 */
export function getFileUrl(docUrl: string | undefined | null): string | null {
  if (!docUrl) {
    return null;
  }

  // Obtenir l'URL de base de l'API (comme dans api.ts)
  const getAPIBaseURL = () => {
    // Priorité 1: Variable d'environnement
    if (import.meta.env.VITE_API_URL) {
      // Enlever /api de la fin si présent car on va l'ajouter
      return import.meta.env.VITE_API_URL.replace(/\/api$/, '');
    }
    
    // Priorité 2: Détection automatique de Vercel
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      // Détecter Vercel (vercel.app) ou tout autre domaine de production
      if (hostname.includes('vercel.app') || hostname.includes('vercel.com')) {
        return 'https://application-web-de-d-claration.onrender.com';
      }
      // Détecter si on est en production (pas localhost)
      if (hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.includes('192.168.')) {
        return 'https://application-web-de-d-claration.onrender.com';
      }
    }
    
    // Développement local
    return '';
  };

  const apiBaseURL = getAPIBaseURL();

  // Si c'est déjà une URL complète (http/https), extraire le nom de fichier
  if (docUrl.startsWith('http://') || docUrl.startsWith('https://')) {
    try {
      const url = new URL(docUrl);
      const fileName = url.pathname.split('/').pop() || '';
      if (fileName) {
        return `${apiBaseURL}/api/files/${fileName}`;
      }
    } catch (e) {
      // Si l'URL est invalide, continuer avec le traitement normal
    }
    return docUrl;
  }

  // Extraire le nom de fichier du chemin
  let fileName = '';
  
  if (docUrl.startsWith('/uploads')) {
    // Chemin comme /uploads/documents/filename.jpg
    fileName = docUrl.split('/').pop() || '';
  } else if (docUrl.startsWith('/')) {
    // Chemin absolu
    fileName = docUrl.split('/').pop() || '';
  } else {
    // Nom de fichier direct
    fileName = docUrl.split('/').pop() || docUrl;
  }

  // Utiliser la route API pour servir le fichier avec l'URL complète du backend
  if (fileName) {
    const finalUrl = `${apiBaseURL}/api/files/${fileName}`;
    console.log(`📄 Construction URL fichier:`, {
      docUrl,
      fileName,
      apiBaseURL,
      finalUrl
    });
    return finalUrl;
  }

  console.warn(`⚠️ Impossible de construire l'URL du fichier:`, docUrl);
  return null;
}

