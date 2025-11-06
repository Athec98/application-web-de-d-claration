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

  // Si c'est déjà une URL complète (http/https), extraire le nom de fichier
  if (docUrl.startsWith('http://') || docUrl.startsWith('https://')) {
    try {
      const url = new URL(docUrl);
      const fileName = url.pathname.split('/').pop() || '';
      if (fileName) {
        return `/api/files/${fileName}`;
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

  // Utiliser la route API pour servir le fichier
  if (fileName) {
    return `/api/files/${fileName}`;
  }

  return null;
}

