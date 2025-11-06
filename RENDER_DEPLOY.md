# Guide de Déploiement sur Render.com

## 🚀 Déploiement Backend sur Render.com

### Configuration

1. **Créer un nouveau Web Service** sur Render.com
2. **Connecter votre repository Git**
3. **Configuration du service:**

```
Name: civile-app-backend
Environment: Node
Region: (choisir le plus proche)
Branch: main (ou votre branche)
Root Directory: backend
Build Command: npm install
Start Command: npm start
```

### Variables d'Environnement

Ajouter dans Render Dashboard → Environment:

```env
NODE_ENV=production
PORT=10000
HOST=0.0.0.0
MONGODB_URI=votre_uri_mongodb_atlas
JWT_SECRET=votre_secret_jwt_tres_securise
JWT_EXPIRE=30d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre-email@gmail.com
EMAIL_PASS=votre-app-password
EMAIL_FROM=noreply@etatcivil.sn
FRONTEND_URL=https://votre-frontend.onrender.com
API_URL=https://civile-app-backend.onrender.com
```

### Important pour Render.com

- **Root Directory:** `backend` (pas la racine)
- **Build Command:** `npm install` (pas besoin de build, c'est du Node.js)
- **Start Command:** `npm start`
- **Port:** Render utilise le port défini dans `PORT` (10000 dans render.yaml)

## 🎨 Déploiement Frontend sur Render.com

### Option 1: Static Site (Recommandé - Gratuit)

1. **Créer un nouveau Static Site**
2. **Configuration:**

```
Name: civile-app-frontend
Build Command: cd frontend && npm install && npm run build
Publish Directory: frontend/dist
```

3. **Variables d'environnement:**

```env
VITE_API_URL=https://civile-app-backend.onrender.com/api
```

### Option 2: Web Service (Si besoin de Node.js)

1. **Créer un nouveau Web Service**
2. **Configuration:**

```
Name: civile-app-frontend
Environment: Node
Root Directory: frontend
Build Command: npm install && npm run build
Start Command: npx serve -s dist -l 3000
```

## 📝 Fichier render.yaml (Backend uniquement)

Le fichier `backend/render.yaml` est déjà configuré. Assurez-vous que:

1. **Root Directory** est défini à `backend` dans Render Dashboard
2. Les variables d'environnement sont ajoutées dans Render Dashboard
3. **Build Command:** `cd backend && npm install` (déjà dans render.yaml)
4. **Start Command:** `cd backend && npm start` (déjà dans render.yaml)

## ⚠️ Problèmes Courants sur Render

### 1. "Build failed: Could not resolve entry module"
**Cause:** Le build essaie de builder le frontend depuis la racine

**Solution:** 
- Définir **Root Directory** à `backend` dans Render Dashboard
- OU utiliser le fichier `render.yaml` qui spécifie déjà `cd backend`

### 2. "Port already in use"
**Cause:** Render assigne automatiquement un port

**Solution:** 
- Utiliser `process.env.PORT` dans `backend/app.js` (déjà fait)
- Render définit automatiquement `PORT` dans les variables d'environnement

### 3. "MongoDB connection failed"
**Solutions:**
- Vérifier `MONGODB_URI` dans Render Dashboard
- Dans MongoDB Atlas → Network Access → Add IP Address → `0.0.0.0/0` (toutes les IPs)

### 4. "CORS error"
**Solutions:**
- Ajouter l'URL du frontend Render dans `FRONTEND_URL`
- Exemple: `FRONTEND_URL=https://civile-app-frontend.onrender.com`

## 🔧 Configuration Recommandée

### Backend (Web Service)
- **Plan:** Free (pour commencer)
- **Auto-Deploy:** Yes
- **Health Check Path:** `/`
- **Root Directory:** `backend`

### Frontend (Static Site)
- **Plan:** Free
- **Auto-Deploy:** Yes
- **Root Directory:** `frontend`

## 📋 Checklist de Déploiement Render

- [ ] Backend déployé et accessible
- [ ] Frontend déployé et accessible
- [ ] Variables d'environnement configurées
- [ ] MongoDB connecté (vérifier les logs)
- [ ] CORS configuré (FRONTEND_URL)
- [ ] Health check fonctionne (`/`)
- [ ] API accessible (`/api-docs`)

## 🔗 URLs après Déploiement

- **Backend:** `https://civile-app-backend.onrender.com`
- **Frontend:** `https://civile-app-frontend.onrender.com`
- **API Docs:** `https://civile-app-backend.onrender.com/api-docs`

## 💡 Astuce

Pour éviter les problèmes de build, **déployez le backend et le frontend séparément**:
1. Backend = Web Service (Node.js)
2. Frontend = Static Site (ou Web Service avec serve)

