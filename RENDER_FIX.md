# 🔧 Fix Immédiat pour Render.com

## ❌ Erreur Actuelle
```
Could not resolve entry module "client/index.html"
```

## ✅ Solution (2 options)

### Option 1: Utiliser Root Directory (RECOMMANDÉ)

Dans Render Dashboard → Settings de votre service backend:

1. **Root Directory:** Définir à `backend` (pas `.` ou vide)
2. **Build Command:** `npm install`
3. **Start Command:** `npm start`
4. **Environment:** Node
5. Cliquez sur **"Save Changes"** et **"Manual Deploy"**

### Option 2: Modifier les Commandes (si Root Directory = ".")

Si vous ne pouvez pas changer Root Directory:

1. **Build Command:** `cd backend && npm install`
2. **Start Command:** `cd backend && npm start`

## 📋 Configuration Complète Render Dashboard

### Backend Service Settings

```
Name: civile-app-backend
Environment: Node
Region: (choisir)
Branch: main
Root Directory: backend  ← CRUCIAL!
Build Command: npm install
Start Command: npm start
Plan: Free
```

### Variables d'Environnement (Environment Variables)

Ajoutez toutes ces variables dans Render Dashboard:

```
NODE_ENV=production
PORT=10000
HOST=0.0.0.0
MONGODB_URI=votre_uri_mongodb_atlas
JWT_SECRET=votre_secret_jwt_securise
JWT_EXPIRE=30d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre-email@gmail.com
EMAIL_PASS=votre-app-password
EMAIL_FROM=noreply@etatcivil.sn
FRONTEND_URL=https://votre-frontend.onrender.com
API_URL=https://civile-app-backend.onrender.com
```

## 🎯 Frontend (Static Site)

Créer un **nouveau Static Site**:

```
Name: civile-app-frontend
Build Command: cd frontend && npm install && npm run build
Publish Directory: frontend/dist
```

Variables:
```
VITE_API_URL=https://civile-app-backend.onrender.com/api
```

## ✅ Vérification

Après déploiement, testez:

1. **Backend Health:** `https://civile-app-backend.onrender.com/`
   - Doit retourner: `{"message":"🇸🇳 API CIVILE-APP",...}`

2. **API Docs:** `https://civile-app-backend.onrender.com/api-docs`
   - Doit afficher Swagger UI

3. **Frontend:** `https://civile-app-frontend.onrender.com`
   - Doit afficher l'application

## 🆘 Si ça ne marche toujours pas

1. Vérifiez les **Logs** dans Render Dashboard
2. Vérifiez que **Root Directory = backend**
3. Vérifiez que toutes les **variables d'environnement** sont définies
4. Vérifiez que **MongoDB Atlas** a whitelisté `0.0.0.0/0`

