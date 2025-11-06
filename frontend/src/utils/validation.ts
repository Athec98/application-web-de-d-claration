/**
 * Utilitaires de validation pour les formulaires
 */

/**
 * Valide un nom ou prénom (lettres, espaces, tirets, apostrophes)
 * @param value - La valeur à valider
 * @returns true si valide, false sinon
 */
export function isValidName(value: string): boolean {
  if (!value || value.trim() === '') return false;
  // Permettre lettres, espaces, tirets, apostrophes (pour noms composés)
  const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
  return nameRegex.test(value.trim());
}

/**
 * Valide un numéro (seulement des chiffres)
 * @param value - La valeur à valider
 * @returns true si valide, false sinon
 */
export function isValidNumber(value: string): boolean {
  if (!value || value.trim() === '') return false;
  // Seulement des chiffres
  const numberRegex = /^\d+$/;
  return numberRegex.test(value.trim());
}

/**
 * Valide une adresse (chaîne de caractères non vide)
 * @param value - La valeur à valider
 * @returns true si valide, false sinon
 */
export function isValidAddress(value: string): boolean {
  if (!value || value.trim() === '') return false;
  // Adresse doit contenir au moins 5 caractères
  return value.trim().length >= 5;
}

/**
 * Valide un email
 * @param value - La valeur à valider
 * @returns true si valide, false sinon
 */
export function isValidEmail(value: string): boolean {
  if (!value || value.trim() === '') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value.trim());
}

/**
 * Valide un numéro de téléphone sénégalais
 * @param value - La valeur à valider
 * @returns true si valide, false sinon
 */
export function isValidSenegalesePhone(value: string): boolean {
  if (!value || value.trim() === '') return false;
  // Format sénégalais : +221 XX XXX XX XX ou 7XXXXXXXXX
  const phoneRegex = /^(\+221|221)?[0-9]{9}$/;
  const phoneCleaned = value.replace(/\s+/g, '');
  return phoneRegex.test(phoneCleaned);
}

/**
 * Valide une date (format YYYY-MM-DD)
 * @param value - La valeur à valider
 * @returns true si valide, false sinon
 */
export function isValidDate(value: string): boolean {
  if (!value || value.trim() === '') return false;
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(value)) return false;
  const date = new Date(value);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Valide une heure (format HH:MM)
 * @param value - La valeur à valider
 * @returns true si valide, false sinon
 */
export function isValidTime(value: string): boolean {
  if (!value || value.trim() === '') return false;
  const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(value.trim());
}

/**
 * Valide un poids (nombre positif)
 * @param value - La valeur à valider
 * @returns true si valide, false sinon
 */
export function isValidWeight(value: string): boolean {
  if (!value || value.trim() === '') return true; // Optionnel
  const weight = parseFloat(value);
  return !isNaN(weight) && weight > 0 && weight <= 10; // Entre 0 et 10 kg (bébé)
}

/**
 * Valide une taille (nombre positif)
 * @param value - La valeur à valider
 * @returns true si valide, false sinon
 */
export function isValidHeight(value: string): boolean {
  if (!value || value.trim() === '') return true; // Optionnel
  const height = parseFloat(value);
  return !isNaN(height) && height > 0 && height <= 100; // Entre 0 et 100 cm (bébé)
}

