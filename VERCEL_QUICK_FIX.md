# 🔧 Fix Rapide Vercel - Frontend

## ❌ Erreur Actuelle
```
Impossible de résoudre le module d'entrée « client/index.html »
```

## ✅ Solution en 2 Étapes

### Étape 1: Changer Root Directory

Dans Vercel Dashboard:

1. Allez dans **Settings** → **General**
2. Trouvez **"Root Directory"**
3. Changez de `./` à `frontend`
4. Cliquez **"Save"**

### Étape 2: Corriger VITE_API_URL

1. Allez dans **Settings** → **Environment Variables**
2. Trouvez `VITE_API_URL`
3. Changez la valeur:
   ```
   https://votre-backend.onrender.com/api
   ```
   (Remplacez `votre-backend` par le nom réel de votre backend Render)
4. Cliquez **"Save"**

### Étape 3: Redéployer

1. Allez dans **Deployments**
2. Cliquez sur **"Redeploy"** du dernier déploiement
3. Ou faites un commit et push

## 📸 Configuration Vercel

```
┌─────────────────────────────────────┐
│ Settings → General                  │
├─────────────────────────────────────┤
│ Root Directory: [frontend]        │ ← ICI!
│ Framework: Vite                     │
│ Build Command: (auto)               │
│ Output Directory: dist              │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Settings → Environment Variables    │
├─────────────────────────────────────┤
│ VITE_API_URL =                      │
│ https://votre-backend.onrender.com/api│ ← ICI!
└─────────────────────────────────────┘
```

## ✅ Après Redéploiement

Le build devrait maintenant:
1. ✅ Trouver `frontend/index.html`
2. ✅ Builder correctement
3. ✅ Déployer dans `frontend/dist`

## 🎯 Variables à Garder

**Gardez seulement:**
- `VITE_API_URL` = `https://votre-backend.onrender.com/api`

**Supprimez** (ne sont pas pour le frontend):
- `MONGODB_URI`
- `JWT_SECRET`
- `EMAIL_*`
- `PORT`
- `NODE_ENV`
- etc.

## 🆘 Si ça ne marche toujours pas

1. Vérifiez que Root Directory = `frontend` (exactement)
2. Vérifiez que `vercel.json` n'existe pas à la racine (ou supprimez-le)
3. Vérifiez les logs de build dans Vercel
4. Vérifiez que `frontend/index.html` existe

