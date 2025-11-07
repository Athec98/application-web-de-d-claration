# 🏠 Builder Localement et Déployer

## Option Simple: Builder + Surge.sh

### Étape 1: Builder

```bash
cd frontend
npm install
npm run build
```

### Étape 2: Vérifier

```bash
# Vérifier que dist/ existe
ls -la dist/

# Devrait contenir:
# - index.html
# - assets/
# - etc.
```

### Étape 3: Déployer sur Surge.sh

```bash
# Installer Surge (une seule fois)
npm install -g surge

# Aller dans le dossier dist
cd dist

# Déployer
surge

# Suivre les instructions:
# - Email: votre-email@example.com
# - Domain: votre-app.surge.sh (ou laissez vide pour un nom aléatoire)
# - Project: . (point = dossier actuel)
```

### Étape 4: C'est Fini! 🎉

Votre site sera disponible sur `votre-app.surge.sh`

## Option Alternative: Netlify Drop

1. Allez sur [app.netlify.com/drop](https://app.netlify.com/drop)
2. Glissez-déposez le dossier `frontend/dist`
3. C'est tout!

## Mettre à Jour

Pour mettre à jour après des changements:

```bash
cd frontend
npm run build
cd dist
surge
# Utiliser le même domaine qu'avant
```

## Avantages

- ✅ Pas de configuration complexe
- ✅ Pas de problèmes TypeScript
- ✅ Déploiement en 30 secondes
- ✅ Gratuit
- ✅ HTTPS automatique

