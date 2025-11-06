# ⚡ Configuration Vercel - Guide Complet

## 🎯 Solution Immédiate

### Dans Vercel Dashboard → Settings → General

Changez ces paramètres:

```
Root Directory: frontend
Framework Preset: Vite (détecté automatiquement)
Build Command: (laisser vide - auto)
Output Directory: dist (auto)
Install Command: (laisser vide - auto)
```

### Dans Vercel Dashboard → Settings → Environment Variables

**IMPORTANT:** Changez `VITE_API_URL`:

```
VITE_API_URL = https://votre-backend.onrender.com/api
```

**Supprimez** toutes les autres variables qui ne sont pas pour le frontend:
- ❌ `MONGODB_URI`
- ❌ `JWT_SECRET`
- ❌ `EMAIL_*`
- ❌ `PORT`
- ❌ `NODE_ENV`
- ❌ etc.

**Gardez seulement:**
- ✅ `VITE_API_URL`

## 📋 Configuration Complète

### Option A: Via Dashboard (RECOMMANDÉ)

1. **Root Directory:** `frontend`
2. **Framework:** Vite (auto-détecté)
3. **Build Command:** (vide - Vercel détecte automatiquement)
4. **Output Directory:** `dist` (auto)
5. **Environment Variables:** Seulement `VITE_API_URL`

### Option B: Via vercel.json

Le fichier `vercel.json` à la racine est déjà créé avec la bonne configuration.

**Mais** il est préférable d'utiliser **Root Directory = frontend** dans le Dashboard.

## ✅ Étapes Détaillées

### 1. Modifier Root Directory

1. Allez dans votre projet Vercel
2. **Settings** → **General**
3. Scroll jusqu'à **"Root Directory"**
4. Changez de `./` à `frontend`
5. Cliquez **"Save"**

### 2. Nettoyer les Variables d'Environnement

1. **Settings** → **Environment Variables**
2. **Supprimez** toutes les variables sauf `VITE_API_URL`
3. **Modifiez** `VITE_API_URL`:
   ```
   https://votre-backend.onrender.com/api
   ```
   (Remplacez `votre-backend` par le vrai nom de votre backend Render)
4. Cliquez **"Save"**

### 3. Redéployer

1. Allez dans **Deployments**
2. Cliquez sur les **3 points (...)** du dernier déploiement
3. Cliquez **"Redeploy"**
4. Ou faites un commit et push

## 🔍 Vérification

Après redéploiement, le build devrait:

1. ✅ Trouver `frontend/index.html`
2. ✅ Installer les dépendances dans `frontend/`
3. ✅ Builder avec Vite
4. ✅ Déployer `frontend/dist/`

## 🎯 URLs Finales

- **Backend:** `https://votre-backend.onrender.com`
- **Frontend:** `https://votre-projet.vercel.app`
- **API:** `https://votre-backend.onrender.com/api`

## ⚠️ Erreurs Courantes

### "Cannot find module client/index.html"
→ Root Directory n'est pas `frontend`

### "CORS error"
→ `VITE_API_URL` pointe vers localhost au lieu de Render

### "Build failed"
→ Vérifiez les logs pour l'erreur exacte

## 📝 Checklist

- [ ] Root Directory = `frontend` dans Vercel Dashboard
- [ ] `VITE_API_URL` = URL du backend Render (pas localhost)
- [ ] Variables backend supprimées
- [ ] Redéployé avec succès
- [ ] Frontend accessible
- [ ] API calls fonctionnent

