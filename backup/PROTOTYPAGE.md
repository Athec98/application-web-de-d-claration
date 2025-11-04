# Prototypage des Interfaces - Application État Civil Sénégal

Ce document présente les maquettes conceptuelles (wireframes) pour les principaux écrans de l'application. Il sert de guide pour le développement du frontend.

## 1. Écran de Connexion

- **Objectif** : Permettre aux utilisateurs (Parent, Mairie, Hôpital) de se connecter.
- **Éléments** :
  - Logo de l'application (Armoiries du Sénégal)
  - Titre : "Connexion à l'Espace État Civil"
  - Champ : Email ou Numéro de téléphone
  - Champ : Mot de passe
  - Bouton : "Se Connecter"
  - Lien : "Mot de passe oublié ?"
  - Lien : "Créer un compte Parent"

## 2. Écran d'Inscription (Parent)

- **Objectif** : Permettre aux parents de créer un nouveau compte.
- **Éléments** :
  - Logo et Titre
  - Champ : Nom
  - Champ : Prénom
  - Champ : Numéro de téléphone
  - Champ : Adresse email (optionnel)
  - Champ : Mot de passe
  - Champ : Confirmer le mot de passe
  - Case à cocher : "J'accepte les conditions d'utilisation"
  - Bouton : "S'inscrire"

## 3. Tableau de Bord (Parent)

- **Objectif** : Offrir une vue d'ensemble des déclarations et des actions possibles.
- **Éléments** :
  - En-tête avec le nom de l'utilisateur et un bouton de déconnexion.
  - Bouton principal : "+ Nouvelle Déclaration de Naissance"
  - Section : "Mes Déclarations en Cours"
    - Tableau avec : Nom de l'enfant, Date de soumission, Statut (En cours, En attente, Rejeté, Validé)
  - Section : "Mes Documents Disponibles"
    - Tableau avec : Nom de l'enfant, Type de document (Acte de naissance, Extrait), Bouton "Télécharger (250 F)"

## 4. Formulaire de Déclaration de Naissance

- **Objectif** : Guider le parent dans la saisie des informations pour une nouvelle déclaration.
- **Éléments** :
  - **Section 1 : Informations sur l'Enfant**
    - Champ : Nom
    - Champ : Prénom(s)
    - Champ : Sexe (Masculin / Féminin)
    - Champ : Date et heure de naissance
    - Champ : Hôpital ou lieu de naissance
  - **Section 2 : Informations sur les Parents**
    - Champ : Nom et Prénom du Père
    - Champ : Numéro d'ID du Père
    - Champ : Nom et Prénom de la Mère
    - Champ : Numéro d'ID de la Mère
    - Champ : Adresse de résidence
  - **Section 3 : Documents Justificatifs**
    - Champ de téléversement : Certificat d'accouchement
    - Champ de téléversement : Pièce d'identité du Père
    - Champ de téléversement : Pièce d'identité de la Mère
    - Champ de téléversement : Autres documents (optionnel)
  - Bouton : "Soumettre la Déclaration"

## 5. Tableau de Bord (Mairie)

- **Objectif** : Permettre à l'agent de la mairie de traiter les demandes.
- **Éléments** :
  - En-tête avec le nom de l'agent.
  - Filtres : Afficher par statut (Nouvelle, En vérification, Validée, Rejetée)
  - Tableau des demandes :
    - Colonnes : Nom de l'enfant, Date de soumission, Statut, Bouton "Consulter"

## 6. Vue détaillée de la Déclaration (Mairie)

- **Objectif** : Afficher tous les détails pour vérification.
- **Éléments** :
  - Toutes les informations saisies par le parent.
  - Liens pour visualiser les documents justificatifs.
  - **Actions possibles** :
    - Bouton : "Envoyer pour vérification à l'hôpital"
    - Bouton : "Rejeter la demande" (ouvre une modale pour saisir le motif)
    - Bouton : "Fabriquer l'acte de naissance" (disponible après validation de l'hôpital)

## 7. Tableau de Bord (Hôpital)

- **Objectif** : Permettre à l'hôpital de vérifier l'authenticité des certificats d'accouchement.
- **Éléments** :
  - En-tête avec le nom de l'établissement.
  - Tableau des demandes de vérification :
    - Colonnes : Nom de l'enfant, Date de la demande, Bouton "Vérifier"

## 8. Vue de Vérification (Hôpital)

- **Objectif** : Afficher le certificat et permettre la validation.
- **Éléments** :
  - Visualiseur du certificat d'accouchement téléversé.
  - **Actions** :
    - Bouton : "Confirmer l'authenticité"
    - Bouton : "Certificat non conforme" (ouvre une modale pour préciser le problème)
