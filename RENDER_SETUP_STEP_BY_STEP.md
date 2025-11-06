# 🚀 Configuration Render.com - Option 1: Root Directory

## 📋 Étapes Détaillées

### Étape 1: Accéder aux Settings

1. Connectez-vous à [Render.com](https://render.com)
2. Allez dans votre Dashboard
3. Cliquez sur votre service backend (ou créez-en un nouveau)
4. Cliquez sur l'onglet **"Settings"** (en haut)

### Étape 2: Configurer Root Directory

Dans la section **"Build & Deploy"**, trouvez le champ **"Root Directory"**:

```
Root Directory: [backend]
```

**IMPORTANT:** 
- Tapez exactement: `backend` (sans slash, sans point)
- Ne laissez pas vide
- Ne mettez pas `.` ou `./backend`

### Étape 3: Configurer les Commandes

Dans la même section, configurez:

```
Build Command: npm install
Start Command: npm start
```

**Note:** 
- Build Command = `npm install` (pas `npm run build`)
- Start Command = `npm start` (déjà configuré dans backend/package.json)

### Étape 4: Vérifier Environment

Assurez-vous que:
```
Environment: Node
```

### Étape 5: Ajouter les Variables d'Environnement

Cliquez sur **"Environment"** dans le menu de gauche, puis ajoutez:

#### Variables Requises (Minimum)

```
NODE_ENV = production
PORT = 10000
MONGODB_URI = votre_uri_mongodb_atlas
JWT_SECRET = votre_secret_jwt_tres_securise
FRONTEND_URL = https://votre-frontend.onrender.com
```

#### Variables Optionnelles (Email)

```
EMAIL_HOST = smtp.gmail.com
EMAIL_PORT = 587
EMAIL_USER = votre-email@gmail.com
EMAIL_PASS = votre-app-password
EMAIL_FROM = noreply@etatcivil.sn
```

#### Variables Optionnelles (Autres)

```
JWT_EXPIRE = 30d
HOST = 0.0.0.0
API_URL = https://civile-app-backend.onrender.com
```

### Étape 6: Sauvegarder et Déployer

1. Cliquez sur **"Save Changes"** en bas de la page
2. Allez dans l'onglet **"Events"** ou **"Manual Deploy"**
3. Cliquez sur **"Manual Deploy"** → **"Deploy latest commit"**

### Étape 7: Vérifier le Déploiement

Attendez que le build se termine (2-3 minutes), puis testez:

1. **Health Check:**
   ```
   https://votre-backend.onrender.com/
   ```
   Doit retourner: `{"message":"🇸🇳 API CIVILE-APP",...}`

2. **API Docs:**
   ```
   https://votre-backend.onrender.com/api-docs
   ```
   Doit afficher Swagger UI

3. **Logs:**
   - Allez dans l'onglet **"Logs"**
   - Vérifiez qu'il n'y a pas d'erreurs
   - Vous devriez voir: `🚀 Serveur démarré sur le port 10000`

## ✅ Configuration Finale

Votre configuration devrait ressembler à ça:

```
┌─────────────────────────────────────────────┐
│ Settings - civile-app-backend               │
├─────────────────────────────────────────────┤
│ Name: civile-app-backend                   │
│ Environment: Node                           │
│ Region: (choisir)                          │
│ Branch: main                               │
│ Root Directory: backend          ← ICI!   │
│ Build Command: npm install                 │
│ Start Command: npm start                  │
│ Health Check Path: /                       │
│ Plan: Free                                 │
└─────────────────────────────────────────────┘
```

## 🆘 Problèmes Courants

### "Build failed: Cannot find module"
→ Vérifiez que Root Directory = `backend` (exactement)

### "Port already in use"
→ Normal, Render gère le port automatiquement via `process.env.PORT`

### "MongoDB connection failed"
→ Vérifiez MONGODB_URI et whitelist IP dans MongoDB Atlas

### "CORS error"
→ Ajoutez FRONTEND_URL avec l'URL exacte de votre frontend

## 📝 Notes Importantes

1. **Root Directory** doit être `backend` (pas `./backend` ou `/backend`)
2. **Build Command** = `npm install` (pas `npm run build`)
3. **PORT** est automatiquement défini par Render (10000 dans render.yaml)
4. Toutes les **variables d'environnement** doivent être ajoutées manuellement dans Render Dashboard

## 🎯 Prochaines Étapes

Après que le backend fonctionne:

1. Créez un **Static Site** pour le frontend
2. Configurez:
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/dist`
   - Variable: `VITE_API_URL=https://votre-backend.onrender.com/api`

