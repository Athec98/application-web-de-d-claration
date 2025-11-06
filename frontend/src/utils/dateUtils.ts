/**
 * Formate une date de manière sécurisée
 * @param date - Date à formater (string, Date, ou undefined)
 * @param options - Options de formatage (par défaut: format français)
 * @returns Date formatée ou "N/A" si la date est invalide
 */
export function formatDate(
  date: string | Date | undefined | null,
  options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }
): string {
  if (!date) {
    return 'N/A';
  }

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Vérifier si la date est valide
    if (isNaN(dateObj.getTime())) {
      return 'N/A';
    }

    return dateObj.toLocaleDateString('fr-FR', options);
  } catch (error) {
    return 'N/A';
  }
}

/**
 * Formate une date avec l'heure
 * @param date - Date à formater
 * @returns Date et heure formatées ou "N/A"
 */
export function formatDateTime(date: string | Date | undefined | null): string {
  if (!date) {
    return 'N/A';
  }

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return 'N/A';
    }

    return dateObj.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'N/A';
  }
}

