# 🔧 Fix Problème Rollup sur Vercel

## ❌ Erreur Actuelle
```
Error: Cannot find module '@rollup/rollup-linux-x64-gnu'
```

## ✅ Solutions

### Solution 1: Ajouter la Dépendance Manquante (DÉJÀ FAIT)

J'ai ajouté `@rollup/rollup-linux-x64-gnu` dans `package.json`.

**Commit et push:**
```bash
git add .
git commit -m "Fix: Ajouter dépendance Rollup manquante"
git push
```

### Solution 2: Modifier le Build Command dans Vercel

Dans Vercel Dashboard → Settings → Build & Development Settings:

**Build Command:**
```bash
rm -rf node_modules package-lock.json && npm install && npm run build
```

### Solution 3: Utiliser Netlify (RECOMMANDÉ)

Netlify gère mieux ces problèmes. Voir `NETLIFY_DEPLOY.md`

### Solution 4: Forcer l'Installation

Dans Vercel Dashboard, ajoutez dans **Environment Variables**:

```
NPM_CONFIG_LEGACY_PEER_DEPS=true
NPM_CONFIG_OPTIONAL=true
```

## 🎯 Solution Rapide

1. **Commit les changements:**
   ```bash
   git add .
   git commit -m "Fix: Rollup dependencies"
   git push
   ```

2. **Dans Vercel Dashboard**, modifiez le **Build Command**:
   ```
   rm -rf node_modules package-lock.json && npm install && npm run build
   ```

3. **Redéployez**

## 🚀 Alternative: Netlify

Si Vercel continue à poser problème, utilisez Netlify:
- Plus tolérant avec ces erreurs
- Configuration similaire
- Gratuit

Voir `NETLIFY_DEPLOY.md` pour les instructions.

