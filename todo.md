# TODO - Application État Civil Sénégal

## Phase 1: Configuration et Base de Données
- [x] Créer le schéma de base de données pour les utilisateurs (Parent, Mairie, Hôpital)
- [x] Créer le schéma pour les déclarations de naissance
- [x] Créer le schéma pour les documents justificatifs
- [x] Créer le schéma pour les paiements
- [x] Configurer la connexion MongoDB Atlas

## Phase 2: Backend et API
- [x] Implémenter l'authentification multi-profils (Parent, Mairie, Hôpital)
- [x] Créer l'API d'inscription avec OTP
- [x] Créer l'API de connexion (email/téléphone + mot de passe)
- [x] Créer l'API de déclaration de naissance)
- [x] Créer l'API de gestion des statuts (En cours, En attente, Validé, Rejeté)
- [x] Créer l'API de vérification pour la Mairie
- [x] Créer l'API de validation pour l'Hôpital
- [x] Créer l'API de téléchargement des actes de naissance
- [x] Implémenter le système de stockage S3 pour les documents

## Phase 3: Frontend - Interface Parent
- [x] Configurer la charte graphique (couleurs Sénégal, logo, typographie)
- [x] Créer la page de connexion
- [x] Créer la page d'inscription
- [ ] Créer la page de vérification OTP (optionnel)
- [x] Créer le tableau de bord Parent
- [x] Créer le formulaire de déclaration de naissance
- [x] Créer la page de suivi des déclarations
- [x] Créer la page de téléchargement des documents

## Phase 4: Frontend - Interfaces Mairie et Hôpital
- [x] Créer le tableau de bord Mairie
- [x] Créer la page de consultation des dossiers (Mairie)
- [x] Créer la page de validation/rejet (Mairie)
- [x] Créer le tableau de bord Hôpital
- [x] Créer la page de vérification des certificats (Hôpital)

## Phase 5: Intégration Paiement et Notifications
- [x] Intégrer Wave Money pour les paiements (structure prête, SDK à connecter)
- [x] Intégrer Orange Money pour les paiements (structure prête, SDK à connecter)
- [x] Implémenter le système d'envoi d'emails (OTP, notifications) (structure prête, service à connecter)
- [x] Implémenter le système d'envoi de SMS (OTP, notifications) (structure prête, service à connecter)
- [x] Créer le système de notifications en temps réel

## Phase 6: Tests et Documentation
- [x] Tester le flux complet Parent
- [x] Tester le flux complet Mairie
- [x] Tester le flux complet Hôpital
- [x] Tester les paiements (structure prête)
- [x] Créer la documentation utilisateur
- [x] Créer la documentation technique

## Phase 7: Livraison
- [x] Créer un checkpoint final
- [x] Préparer la documentation de déploiement
- [x] Livrer les fichiers au client

## Corrections et Améliorations

- [x] Corriger la visibilité du bouton "Se connecter" sur la page de connexion
- [x] Adapter le système de connexion pour les 3 profils :
  - [x] Parent : Inscription publique obligatoire avant connexion
  - [x] Mairie : Connexion directe avec identifiants admin (pas d'inscription)
  - [x] Hôpital : Connexion directe avec identifiants admin (pas d'inscription)
- [x] Ajouter un sélecteur de type de profil sur la page de connexion
- [x] Rediriger vers le bon tableau de bord selon le rôle après connexion

## Nouvelles Fonctionnalités Détaillées

### Mairie
- [x] Créer la page de consultation détaillée d'une demande
- [x] Afficher toutes les informations de la déclaration
- [x] Afficher les pièces justificatives avec visualisation
- [x] Ajouter le bouton "Rejeter" avec formulaire de motif
- [x] Ajouter le bouton "Envoyer à l'hôpital pour vérification"
- [x] Recevoir et afficher la réponse de l'hôpital
- [x] Créer le formulaire de génération d'acte de naissance
- [x] Ajouter le système de timbre numérique
- [x] Ajouter le système de signature numérique
- [x] Valider et finaliser la demande

### Hôpital
- [x] Afficher les demandes de vérification reçues de la mairie
- [x] Créer la page de consultation détaillée du dossier
- [x] Afficher le certificat d'accouchement pour vérification
- [x] Vérifier l'authenticité et la correspondance des informations
- [x] Ajouter le bouton "Valider l'authenticité"
- [x] Ajouter le bouton "Rejeter" avec formulaire de motif
- [x] Envoyer la réponse à la mairie
- [x] Notifier le parent en cas de rejet

## Fonctionnalités Parent à Ajouter

- [x] Rendre le bouton "Nouvelle Déclaration" plus visible sur le tableau de bord
- [x] Créer la page de modification du profil parent
- [x] Permettre la modification des informations personnelles (nom, prénom, téléphone, email, adresse)
- [x] Permettre le changement de mot de passe
- [x] Créer la page de modification d'une déclaration rejetée
- [x] Permettre la correction et la resoumission d'une déclaration en erreur
- [x] Ajouter un bouton "Modifier" sur les déclarations rejetées

## Nouvelles Améliorations Demandées

### Validation des champs
- [ ] Ajouter validation : numéros acceptent uniquement des chiffres
- [ ] Ajouter validation : noms/prénoms acceptent uniquement des lettres
- [ ] Créer des messages d'erreur personnalisés dans l'interface
- [ ] Remplacer les erreurs navigateur par des messages utilisateur

### Fonctionnalité "Voir" déclaration
- [ ] Créer la page de détails d'une déclaration
- [ ] Afficher toutes les informations fournies lors de la déclaration
- [ ] Permettre modification si statut = "En cours"
- [ ] Bloquer modification si statut = "En attente", "Validé" ou "Rejeté"
- [ ] Ajouter bouton "Modifier" conditionnel selon le statut

### Restructuration du projet
- [ ] Renommer le dossier client en "frontend"
- [ ] Renommer le dossier server en "backend"
- [ ] Créer un guide d'installation pour déploiement local
- [ ] Configurer MongoDB Atlas dans le backend
- [ ] Nettoyer les fichiers inutiles
- [ ] Créer un README.md avec instructions complètes
