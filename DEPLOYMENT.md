# Guide de Déploiement - CIVILE-APP

Ce guide explique comment déployer l'application CIVILE-APP en production.

## 📋 Table des matières

1. [Prérequis](#prérequis)
2. [Déploiement avec Docker](#déploiement-avec-docker)
3. [Déploiement sur Render](#déploiement-sur-render)
4. [Déploiement sur Vercel (Frontend)](#déploiement-sur-vercel-frontend)
5. [Configuration des variables d'environnement](#configuration-des-variables-denvironnement)
6. [Vérification du déploiement](#vérification-du-déploiement)

## Prérequis

- Node.js 18+ installé
- Docker et Docker Compose (pour le déploiement Docker)
- Compte MongoDB Atlas (ou MongoDB local)
- Compte Render (pour le backend)
- Compte Vercel (pour le frontend)

## Déploiement avec Docker

### 1. Préparer les variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/civile-app?retryWrites=true&w=majority

# JWT
JWT_SECRET=votre_secret_jwt_tres_securise
JWT_EXPIRE=30d

# Email (pour les notifications)
EMAIL_USER=votre_email@gmail.com
EMAIL_PASS=votre_mot_de_passe_application

# URLs
FRONTEND_URL=http://localhost:3000
API_URL=http://localhost:5000
```

### 2. Construire et démarrer les conteneurs

```bash
# Construire les images
docker-compose build

# Démarrer les services
docker-compose up -d

# Voir les logs
docker-compose logs -f
```

### 3. Accéder à l'application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Documentation Swagger**: http://localhost:5000/api-docs

### 4. Arrêter les services

```bash
docker-compose down
```

## Déploiement sur Render

### Backend

1. **Créer un nouveau service Web sur Render**
   - Connectez votre dépôt GitHub
   - Sélectionnez le dossier `backend`
   - Configuration:
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Environment**: `Node`

2. **Configurer les variables d'environnement**
   - Allez dans "Environment" dans le dashboard Render
   - Ajoutez toutes les variables nécessaires (voir section Variables d'environnement)

3. **Déployer**
   - Render déploiera automatiquement à chaque push sur la branche principale
   - L'URL du backend sera: `https://civile-app-backend.onrender.com`

### Frontend (Optionnel sur Render)

Vous pouvez aussi déployer le frontend sur Render, mais Vercel est recommandé pour les applications React.

## Déploiement sur Vercel (Frontend)

1. **Installer Vercel CLI** (optionnel)
   ```bash
   npm i -g vercel
   ```

2. **Déployer via le dashboard Vercel**
   - Connectez votre dépôt GitHub
   - Sélectionnez le dossier `frontend`
   - Vercel détectera automatiquement Vite
   - Configuration automatique via `vercel.json`

3. **Configurer les variables d'environnement**
   - Dans les paramètres du projet Vercel
   - Ajoutez `VITE_API_URL` avec l'URL de votre backend

4. **Mettre à jour vercel.json**
   - Modifiez l'URL du backend dans `frontend/vercel.json`:
   ```json
   {
     "rewrites": [
       {
         "source": "/api/(.*)",
         "destination": "https://votre-backend.onrender.com/api/$1"
       }
     ]
   }
   ```

## Configuration des variables d'environnement

### Backend (.env)

```env
# Base de données
MONGODB_URI=mongodb+srv://...

# JWT
JWT_SECRET=un_secret_tres_long_et_aleatoire
JWT_EXPIRE=30d

# Email
EMAIL_USER=votre_email@gmail.com
EMAIL_PASS=mot_de_passe_application

# URLs
FRONTEND_URL=https://votre-frontend.vercel.app
API_URL=https://votre-backend.onrender.com
NODE_ENV=production
PORT=5000
HOST=0.0.0.0
```

### Frontend

Pour le frontend, créez un fichier `.env.production` dans le dossier `frontend`:

```env
VITE_API_URL=https://votre-backend.onrender.com
```

## Vérification du déploiement

### Backend

1. **Vérifier que le serveur répond**
   ```bash
   curl https://votre-backend.onrender.com
   ```

2. **Vérifier la documentation Swagger**
   - Ouvrez: `https://votre-backend.onrender.com/api-docs`

3. **Tester une route API**
   ```bash
   curl https://votre-backend.onrender.com/api/auth/test
   ```

### Frontend

1. **Vérifier que l'application se charge**
   - Ouvrez l'URL de déploiement dans le navigateur

2. **Vérifier la connexion au backend**
   - Ouvrez la console du navigateur (F12)
   - Vérifiez qu'il n'y a pas d'erreurs CORS

3. **Tester l'authentification**
   - Essayez de vous connecter avec un compte de test

## Dépannage

### Problème: Le backend ne démarre pas

- Vérifiez les logs: `docker-compose logs backend` ou dans le dashboard Render
- Vérifiez que toutes les variables d'environnement sont définies
- Vérifiez la connexion MongoDB

### Problème: Erreurs CORS

- Vérifiez que `FRONTEND_URL` dans le backend correspond à l'URL réelle du frontend
- Vérifiez la configuration CORS dans `backend/app.js`

### Problème: Le frontend ne peut pas se connecter au backend

- Vérifiez que l'URL du backend dans `vercel.json` est correcte
- Vérifiez que la variable `VITE_API_URL` est définie
- Vérifiez les logs du navigateur pour les erreurs

## Sécurité en production

1. **Utilisez HTTPS** (automatique sur Render et Vercel)
2. **Générez un JWT_SECRET fort et unique**
3. **Configurez MongoDB Atlas avec une whitelist IP**
4. **Activez les logs d'audit**
5. **Configurez des backups réguliers de la base de données**

## Support

Pour toute question ou problème, consultez la documentation ou contactez l'équipe de développement.
