# Guide de Déploiement Rapide

## 🚀 Déploiement Rapide (5 minutes)

### 1. Préparer les Variables d'Environnement

**Backend (`backend/.env`):**
```env
MONGODB_URI=votre_uri_mongodb
JWT_SECRET=votre_secret_jwt
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://votre-domaine.com
```

**Frontend (`frontend/.env`):**
```env
VITE_API_URL=https://api.votre-domaine.com/api
```

### 2. Installer les Dépendances

```bash
# Backend
cd backend
npm install --production

# Frontend
cd ../frontend
npm install
npm run build
```

### 3. Créer les Dossiers Nécessaires

```bash
# Dans backend/
mkdir -p uploads/documents
mkdir -p uploads/actes
```

### 4. Démarrer le Backend

```bash
cd backend
npm start
# ou avec PM2
pm2 start app.js --name civile-backend
```

### 5. Servir le Frontend

**Option A: Nginx (Recommandé)**
```bash
# Copier les fichiers buildés
cp -r frontend/dist/* /var/www/html/

# Configurer Nginx (voir DEPLOYMENT.md)
```

**Option B: Node.js simple**
```bash
# Créer server.js à la racine
node server.js
```

## ⚠️ Problèmes Fréquents

### "Cannot find module 'X'"
→ `npm install` dans le dossier concerné

### "Port 5000 already in use"
→ Changer le PORT dans `.env` ou tuer le processus

### "MongoDB connection failed"
→ Vérifier MONGODB_URI et whitelist IP

### "CORS error"
→ Ajouter FRONTEND_URL dans backend/.env

### "Build failed"
→ Vérifier les erreurs TypeScript: `cd frontend && npm run build`

## 📞 Support

Si vous rencontrez d'autres problèmes, vérifiez:
1. Les logs du serveur
2. La console du navigateur
3. Les variables d'environnement
4. La connexion MongoDB

