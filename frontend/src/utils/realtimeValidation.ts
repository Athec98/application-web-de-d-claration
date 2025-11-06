/**
 * Utilitaires de validation en temps réel pour les formulaires
 */

import { isValidName, isValidNumber, isValidAddress, isValidEmail, isValidSenegalesePhone, isValidTime, isValidWeight, isValidHeight } from './validation';

/**
 * Valide un champ en temps réel selon son type
 * @param fieldName - Le nom du champ
 * @param value - La valeur à valider
 * @param fieldType - Le type de validation à appliquer
 * @param isRequired - Si le champ est obligatoire
 * @returns Message d'erreur ou string vide si valide
 */
export function validateFieldRealtime(
  fieldName: string,
  value: string,
  fieldType: 'name' | 'number' | 'address' | 'email' | 'phone' | 'time' | 'weight' | 'height' | 'password' | 'otp' | 'text',
  isRequired: boolean = true
): string {
  // Si le champ est vide
  if (!value || value.trim() === '') {
    if (isRequired) {
      return `${getFieldLabel(fieldName)} est obligatoire`;
    }
    return ''; // Champ optionnel vide = pas d'erreur
  }

  // Validation selon le type
  switch (fieldType) {
    case 'name':
      if (!isValidName(value)) {
        return `${getFieldLabel(fieldName)} ne doit contenir que des lettres, espaces, tirets et apostrophes`;
      }
      break;

    case 'number':
      if (!isValidNumber(value)) {
        return `${getFieldLabel(fieldName)} ne doit contenir que des chiffres`;
      }
      break;

    case 'address':
      if (!isValidAddress(value)) {
        return `${getFieldLabel(fieldName)} doit contenir au moins 5 caractères`;
      }
      break;

    case 'email':
      if (!isValidEmail(value)) {
        return `L'adresse email n'est pas valide`;
      }
      break;

    case 'phone':
      if (!isValidSenegalesePhone(value)) {
        return `Le numéro de téléphone doit être au format sénégalais (+221 XX XXX XX XX ou 7XXXXXXXXX)`;
      }
      break;

    case 'time':
      if (!isValidTime(value)) {
        return `L'heure doit être au format HH:MM (ex: 14:30)`;
      }
      break;

    case 'weight':
      if (!isValidWeight(value)) {
        return `Le poids doit être un nombre positif entre 0 et 10 kg`;
      }
      break;

    case 'height':
      if (!isValidHeight(value)) {
        return `La taille doit être un nombre positif entre 0 et 100 cm`;
      }
      break;

    case 'password':
      if (value.length < 6) {
        return `Le mot de passe doit contenir au moins 6 caractères`;
      }
      break;

    case 'otp':
      if (value.length !== 6) {
        return `Le code de vérification doit contenir exactement 6 chiffres`;
      }
      if (!/^\d{6}$/.test(value)) {
        return `Le code de vérification ne doit contenir que des chiffres`;
      }
      break;

    case 'text':
      // Pas de validation spécifique pour le texte
      break;
  }

  return ''; // Pas d'erreur
}

/**
 * Obtient le label d'un champ à partir de son nom
 */
function getFieldLabel(fieldName: string): string {
  const labels: Record<string, string> = {
    firstName: 'Le prénom',
    lastName: 'Le nom',
    prenomEnfant: 'Le prénom de l\'enfant',
    nomEnfant: 'Le nom de l\'enfant',
    nomPere: 'Le nom du père',
    prenomPere: 'Le prénom du père',
    nomMere: 'Le nom de la mère',
    prenomMere: 'Le prénom de la mère',
    phone: 'Le numéro de téléphone',
    phoneNumber: 'Le numéro de téléphone',
    address: 'L\'adresse',
    lieuNaissance: 'Le lieu de naissance',
    certificatNumero: 'Le numéro du certificat',
    hopitalAutreNom: 'Le nom de l\'hôpital',
    childFirstName: 'Le prénom de l\'enfant',
    childLastName: 'Le nom de l\'enfant',
    fatherFirstName: 'Le prénom du père',
    fatherLastName: 'Le nom du père',
    motherFirstName: 'Le prénom de la mère',
    motherLastName: 'Le nom de la mère',
    fatherIdNumber: 'Le numéro de pièce d\'identité du père',
    motherIdNumber: 'Le numéro de pièce d\'identité de la mère',
    residenceAddress: 'L\'adresse de résidence',
    identifier: 'L\'identifiant',
    password: 'Le mot de passe',
    confirmPassword: 'La confirmation du mot de passe',
    currentPassword: 'Le mot de passe actuel',
    newPassword: 'Le nouveau mot de passe',
    otp: 'Le code de vérification',
    email: 'L\'adresse email',
  };

  return labels[fieldName] || fieldName;
}

/**
 * Valide un identifiant (email ou téléphone) en temps réel
 */
export function validateIdentifier(value: string): string {
  if (!value || value.trim() === '') {
    return 'L\'identifiant (email ou téléphone) est obligatoire';
  }

  const isEmail = value.includes('@');
  const isPhone = /^(\+221|221)?[0-9]{9}$/.test(value.replace(/\s+/g, ''));

  if (!isEmail && !isPhone) {
    return 'L\'identifiant doit être un email valide ou un numéro de téléphone sénégalais';
  }

  return '';
}

/**
 * Valide la confirmation de mot de passe en temps réel
 */
export function validatePasswordConfirmation(password: string, confirmPassword: string): string {
  if (!confirmPassword || confirmPassword.trim() === '') {
    return 'La confirmation du mot de passe est obligatoire';
  }

  if (password !== confirmPassword) {
    return 'Les mots de passe ne correspondent pas';
  }

  return '';
}

/**
 * Valide une date en temps réel
 */
export function validateDateRealtime(value: string, isRequired: boolean = true, maxDate?: Date, minDate?: Date): string {
  if (!value || value.trim() === '') {
    if (isRequired) {
      return 'La date est obligatoire';
    }
    return '';
  }

  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return 'La date n\'est pas valide';
  }

  if (maxDate && date > maxDate) {
    return 'La date ne peut pas être dans le futur';
  }

  if (minDate && date < minDate) {
    return 'La date ne peut pas être antérieure à cette date';
  }

  return '';
}

