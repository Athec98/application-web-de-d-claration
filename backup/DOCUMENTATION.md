# Documentation Technique - Application État Civil Sénégal

## Vue d'ensemble

L'application État Civil Sénégal est une plateforme web complète permettant la gestion numérique des déclarations de naissance au Sénégal. Elle intègre trois types d'utilisateurs avec des rôles distincts : **Parents**, **Mairie** et **Hôpital**.

## Architecture

L'application suit une architecture moderne avec séparation frontend/backend :

- **Frontend** : React 19 avec Vite, Tailwind CSS 4, shadcn/ui
- **Backend** : Node.js avec Express 4, tRPC 11
- **Base de données** : MySQL/TiDB (via Drizzle ORM)
- **Stockage** : S3 pour les documents et fichiers
- **Authentification** : Manus OAuth avec gestion de rôles

## Charte Graphique

La charte graphique respecte les symboles nationaux du Sénégal :

### Couleurs Principales
- **Vert Sénégal** : `#00853F` - Actions principales, navigation
- **Jaune Sénégal** : `#FDEF42` - Accents, avertissements
- **Rouge Sénégal** : `#E31B23` - Erreurs, alertes

### Typographie
- **Titres** : Merriweather (serif) - Caractère formel et officiel
- **Corps de texte** : Roboto (sans-serif) - Lisibilité optimale

### Éléments Visuels
- Logo : Armoiries de la République du Sénégal
- Devise nationale : "Un Peuple - Un But - Une Foi"

## Workflow de Déclaration

Le processus de déclaration de naissance suit ce workflow :

1. **Parent** : Inscription et création de compte avec vérification OTP
2. **Parent** : Soumission d'une déclaration avec documents justificatifs
   - Informations de l'enfant (nom, prénom, sexe, date/lieu de naissance)
   - Informations des parents (noms, prénoms, numéros d'identité)
   - Documents : certificat d'accouchement, pièces d'identité
3. **Mairie** : Consultation et vérification du dossier
   - Si complet : envoi à l'hôpital pour vérification
   - Si incomplet : rejet avec motif
4. **Hôpital** : Vérification de l'authenticité du certificat d'accouchement
   - Si valide : retour à la mairie (statut "En attente")
   - Si non conforme : rejet avec motif
5. **Mairie** : Génération de l'acte de naissance (statut "Validé")
6. **Parent** : Téléchargement de l'acte moyennant 250 F CFA par téléchargement

## Schéma de Base de Données

### Table `users`
Gestion des utilisateurs avec rôles multiples.

Champs principaux :
- `id` : Identifiant unique
- `role` : parent | mairie | hopital | admin
- `email`, `phoneNumber` : Identifiants de connexion
- `isVerified` : Statut de vérification OTP
- `otpCode`, `otpExpiry` : Gestion OTP

### Table `birthDeclarations`
Stockage des déclarations de naissance.

Champs principaux :
- Informations enfant : `childFirstName`, `childLastName`, `childGender`, `birthDate`, `birthPlace`
- Informations père : `fatherFirstName`, `fatherLastName`, `fatherIdNumber`
- Informations mère : `motherFirstName`, `motherLastName`, `motherIdNumber`
- Statut : `status` (en_cours | en_attente | valide | rejete)
- Métadonnées : `verifiedByMairieAt`, `verifiedByHopitalAt`, `validatedAt`

### Table `documents`
Stockage des références aux documents justificatifs.

Types de documents :
- `certificat_accouchement` : Obligatoire
- `id_pere` : Obligatoire
- `id_mere` : Obligatoire
- `autre` : Optionnel

### Table `birthCertificates`
Actes de naissance générés par la mairie.

Champs principaux :
- `certificateNumber` : Numéro unique d'acte
- `fileUrl`, `fileKey` : Références S3
- `generatedBy` : ID de l'agent de mairie

### Table `payments`
Gestion des paiements pour téléchargement.

Champs principaux :
- `amount` : 250 F CFA
- `paymentMethod` : wave | orange_money
- `paymentStatus` : pending | completed | failed

### Table `notifications`
Notifications pour les utilisateurs.

Types : info | success | warning | error

## API Backend (tRPC)

### Routes d'authentification (`auth`)
- `me` : Obtenir l'utilisateur connecté
- `logout` : Déconnexion
- `register` : Inscription parent avec OTP
- `verifyOTP` : Vérification du code OTP

### Routes de déclarations (`declarations`)
- `create` : Créer une nouvelle déclaration (Parent)
- `getMyDeclarations` : Obtenir mes déclarations (Parent)
- `getAllDeclarations` : Obtenir toutes les déclarations (Mairie)
- `getById` : Obtenir une déclaration par ID
- `sendToHospitalVerification` : Envoyer pour vérification (Mairie)
- `reject` : Rejeter une déclaration (Mairie)
- `validateCertificate` : Valider/rejeter le certificat (Hôpital)
- `generateCertificate` : Générer l'acte de naissance (Mairie)

### Routes de documents (`documents`)
- `upload` : Téléverser un document
- `getByDeclaration` : Obtenir les documents d'une déclaration

### Routes de notifications (`notifications`)
- `getMyNotifications` : Obtenir mes notifications
- `markAsRead` : Marquer comme lue

### Routes de paiements (`payments`)
- `create` : Créer un paiement
- `getStatus` : Vérifier le statut d'un paiement

### Routes de certificats (`certificates`)
- `getByDeclaration` : Obtenir le certificat d'une déclaration

## Pages Frontend

### Pages Publiques
- `/login` : Connexion (email ou téléphone)
- `/register` : Inscription parent

### Pages Parent
- `/dashboard` : Tableau de bord avec liste des déclarations et documents
- `/new-declaration` : Formulaire de nouvelle déclaration

### Pages Mairie
- `/mairie/dashboard` : Tableau de bord avec statistiques et liste des déclarations

### Pages Hôpital
- `/hopital/dashboard` : Tableau de bord avec demandes de vérification

## Intégrations à Compléter

### Système OTP
Actuellement simulé. À intégrer :
- Service SMS (ex: Twilio, service local sénégalais)
- Service Email (ex: SendGrid, SMTP)

### Paiements
Structure prête pour :
- **Wave Money** : API de paiement mobile
- **Orange Money** : API de paiement mobile

Les endpoints de création de paiement sont prêts, il reste à intégrer les SDK des fournisseurs.

### Génération d'Actes
Actuellement génère un fichier texte simple. À améliorer :
- Génération PDF avec template officiel
- Intégration du logo et des armoiries
- Signature numérique

## Déploiement

### Variables d'Environnement Requises
Les variables système sont déjà configurées :
- `DATABASE_URL` : Connexion MySQL/TiDB
- `JWT_SECRET` : Secret pour les sessions
- `VITE_APP_TITLE` : Titre de l'application
- `VITE_APP_LOGO` : URL du logo

### Variables à Ajouter
Pour les intégrations :
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` : Pour SMS
- `SENDGRID_API_KEY` : Pour emails
- `WAVE_API_KEY` : Pour Wave Money
- `ORANGE_MONEY_API_KEY` : Pour Orange Money

### Publication
1. Créer un checkpoint via l'interface
2. Cliquer sur le bouton "Publish" dans l'UI
3. L'application sera déployée sur `*.manus.space`

## Sécurité

### Authentification
- Sessions sécurisées avec cookies HTTP-only
- Vérification OTP pour nouveaux comptes
- Contrôle d'accès basé sur les rôles (RBAC)

### Stockage de Fichiers
- Fichiers stockés sur S3 avec clés uniques
- URLs publiques mais non énumérables
- Métadonnées en base de données

### Validation
- Validation côté client et serveur
- Schémas Zod pour les entrées API
- Sanitisation des données

## Support et Maintenance

Pour toute question ou assistance :
- Documentation en ligne : https://help.manus.im
- Support technique : Via le portail d'aide

## Licence

Application développée pour la République du Sénégal.
