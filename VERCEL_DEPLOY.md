# 🚀 Déploiement Frontend sur Vercel

## ❌ Problème Actuel
Vercel essaie de builder depuis la racine et cherche `client/index.html` qui n'existe pas.

## ✅ Solution

### Option 1: Root Directory (RECOMMANDÉ)

Dans Vercel Dashboard → Settings → General:

1. **Root Directory:** Définir à `frontend`
2. **Framework Preset:** Vite (déjà détecté)
3. **Build Command:** `npm run build` (automatique avec Root Directory)
4. **Output Directory:** `dist` (automatique)

### Option 2: Configuration via vercel.json

Créer `vercel.json` à la racine (voir ci-dessous)

## 📋 Configuration Vercel Dashboard

### Settings → General

```
Root Directory: frontend
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### Settings → Environment Variables

**IMPORTANT:** Changez `VITE_API_URL`:

```
VITE_API_URL = https://votre-backend.onrender.com/api
```

**Ne pas utiliser:**
```
VITE_API_URL = http://localhost:5000/api  ← ❌ Ne fonctionne pas en production
```

## 🔧 Fichier vercel.json (Alternative)

Si vous ne pouvez pas changer Root Directory, créez `vercel.json` à la racine:

```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "installCommand": "cd frontend && npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## ✅ Configuration Recommandée

### Dans Vercel Dashboard:

1. **Root Directory:** `frontend` ← CRUCIAL!
2. **Build Command:** (laisser vide, Vercel détecte automatiquement)
3. **Output Directory:** `dist` (automatique)
4. **Framework:** Vite (détecté automatiquement)

### Variables d'Environnement:

```
VITE_API_URL=https://votre-backend.onrender.com/api
```

**Supprimez** les autres variables qui ne sont pas pour le frontend:
- `MONGODB_URI` (backend seulement)
- `JWT_SECRET` (backend seulement)
- `EMAIL_*` (backend seulement)
- etc.

## 🎯 Étapes Détaillées

### 1. Modifier Root Directory

1. Allez dans votre projet Vercel
2. Settings → General
3. Trouvez "Root Directory"
4. Changez de `./` à `frontend`
5. Cliquez "Save"

### 2. Corriger VITE_API_URL

1. Settings → Environment Variables
2. Trouvez `VITE_API_URL`
3. Changez la valeur:
   ```
   De: http://localhost:5000/api
   À: https://votre-backend.onrender.com/api
   ```
4. Cliquez "Save"

### 3. Supprimer les Variables Backend

Supprimez ces variables (elles ne sont pas pour le frontend):
- `MONGODB_URI`
- `JWT_SECRET`
- `EMAIL_*`
- `PORT`
- `NODE_ENV`
- etc.

**Gardez seulement:**
- `VITE_API_URL`

### 4. Redéployer

1. Allez dans "Deployments"
2. Cliquez sur les 3 points (...) du dernier déploiement
3. "Redeploy"
4. Ou faites un nouveau commit et push

## ✅ Vérification

Après déploiement réussi:

1. **Frontend accessible:** `https://votre-projet.vercel.app`
2. **Pas d'erreurs CORS:** Les appels API fonctionnent
3. **Pas d'erreurs 404:** Les routes fonctionnent

## 🔗 URLs Finales

- **Backend (Render):** `https://votre-backend.onrender.com`
- **Frontend (Vercel):** `https://votre-projet.vercel.app`
- **API Docs:** `https://votre-backend.onrender.com/api-docs`

## ⚠️ Important

1. **VITE_API_URL** doit être l'URL du backend Render (pas localhost)
2. **Root Directory** = `frontend` (pas `.` ou `./frontend`)
3. **Variables d'environnement** = seulement celles qui commencent par `VITE_`

