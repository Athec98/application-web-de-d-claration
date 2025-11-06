# 🔧 Fix Rapide pour Render.com

## Problème Actuel
```
Could not resolve entry module "client/index.html"
```

## ✅ Solution Immédiate

### Option 1: Définir Root Directory dans Render Dashboard (RECOMMANDÉ)

1. Allez dans votre service Render → Settings
2. Trouvez **"Root Directory"**
3. Définissez-le à: `backend`
4. **Build Command:** `npm install`
5. **Start Command:** `npm start`
6. Redéployez

### Option 2: Modifier render.yaml

Le fichier `backend/render.yaml` est déjà configuré. Assurez-vous que dans Render Dashboard:
- **Root Directory** = `backend` (pas `.` ou vide)

### Option 3: Créer un script de build spécifique

Si vous ne pouvez pas changer Root Directory, créez `backend/build.sh`:

```bash
#!/bin/bash
npm install
```

Et dans Render:
- **Build Command:** `bash build.sh`
- **Start Command:** `npm start`

## 📝 Configuration Render Dashboard

### Backend Service
```
Name: civile-app-backend
Environment: Node
Root Directory: backend  ← IMPORTANT!
Build Command: npm install
Start Command: npm start
```

### Variables d'Environnement (Backend)
```
NODE_ENV=production
PORT=10000
MONGODB_URI=...
JWT_SECRET=...
FRONTEND_URL=https://votre-frontend.onrender.com
```

## 🎯 Frontend (Static Site)

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

Après déploiement:
1. Backend accessible: `https://civile-app-backend.onrender.com`
2. Health check: `https://civile-app-backend.onrender.com/` → doit retourner JSON
3. API docs: `https://civile-app-backend.onrender.com/api-docs`

