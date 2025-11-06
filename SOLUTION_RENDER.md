# ✅ SOLUTION IMMÉDIATE POUR RENDER.COM

## Le Problème
Render.com exécute `npm run build` depuis la racine, qui appelle `vite build` qui cherche `client/index.html` (n'existe pas).

## 🎯 Solution en 3 Étapes

### Étape 1: Modifier les Settings dans Render Dashboard

Allez dans votre service backend sur Render.com → **Settings**

Changez:
- **Root Directory:** `backend` (au lieu de `.` ou vide)
- **Build Command:** `npm install` (au lieu de `npm run build`)
- **Start Command:** `npm start`

### Étape 2: Variables d'Environnement

Dans Render Dashboard → **Environment**, ajoutez:

```
NODE_ENV=production
PORT=10000
MONGODB_URI=votre_uri_mongodb
JWT_SECRET=votre_secret
FRONTEND_URL=https://votre-frontend.onrender.com
```

### Étape 3: Redéployer

1. Cliquez sur **"Save Changes"**
2. Cliquez sur **"Manual Deploy"** → **"Deploy latest commit"**

## 📸 Capture d'Écran des Settings

```
┌─────────────────────────────────────┐
│ Settings - civile-app-backend       │
├─────────────────────────────────────┤
│ Root Directory: [backend      ]    │ ← IMPORTANT!
│ Build Command:  [npm install  ]    │
│ Start Command:  [npm start    ]    │
│ Environment:    [Node          ]    │
└─────────────────────────────────────┘
```

## ✅ Vérification

Après déploiement, ouvrez:
- `https://votre-backend.onrender.com/` → Doit afficher JSON avec message API
- `https://votre-backend.onrender.com/api-docs` → Doit afficher Swagger

## 🆘 Si ça ne marche toujours pas

1. **Vérifiez les logs:** Render Dashboard → Logs
2. **Vérifiez Root Directory:** Doit être `backend`
3. **Vérifiez les variables:** Toutes doivent être définies
4. **Vérifiez MongoDB:** Whitelist `0.0.0.0/0` dans MongoDB Atlas

## 📝 Alternative: Utiliser render.yaml

Si vous préférez utiliser le fichier `render.yaml`:

1. Assurez-vous que `backend/render.yaml` existe
2. Dans Render Dashboard, laissez Root Directory = `.` (racine)
3. Render utilisera automatiquement `render.yaml`
4. Les commandes dans `render.yaml` utilisent `cd backend && ...`

**MAIS** la solution la plus simple est de définir **Root Directory = backend** dans Render Dashboard.

