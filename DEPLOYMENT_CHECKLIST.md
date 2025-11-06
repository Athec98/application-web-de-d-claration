# Checklist de Déploiement

## ✅ Pré-déploiement

### Backend
- [ ] Variables d'environnement configurées (`.env`)
- [ ] MongoDB Atlas configuré avec whitelist IP
- [ ] Dossiers `uploads/documents` et `uploads/actes` créés
- [ ] Toutes les dépendances installées (`npm install`)
- [ ] Tests de connexion MongoDB réussis
- [ ] Configuration email (Nodemailer) testée

### Frontend
- [ ] Variables d'environnement configurées (`.env`)
- [ ] `VITE_API_URL` pointant vers l'API de production
- [ ] Build testé localement (`npm run build`)
- [ ] Fichiers statiques générés dans `dist/`

## 🔧 Problèmes Courants et Solutions

### 1. Erreur: "Cannot find module"
**Solution:**
```bash
cd backend && npm install --production
cd ../frontend && npm install && npm run build
```

### 2. Erreur: "Port already in use"
**Solution:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :5000
kill -9 <PID>
```

### 3. Erreur: "MongoDB connection failed"
**Solutions:**
- Vérifier `MONGODB_URI` dans `.env`
- Vérifier la whitelist IP dans MongoDB Atlas (ajouter `0.0.0.0/0` pour toutes les IPs)
- Vérifier les credentials MongoDB

### 4. Erreur: "CORS policy"
**Solutions:**
- Ajouter l'URL du frontend dans `FRONTEND_URL` (backend/.env)
- Vérifier la configuration CORS dans `backend/app.js`
- S'assurer que les headers CORS sont corrects

### 5. Erreur: "Cannot read property of undefined"
**Solutions:**
- Vérifier que toutes les routes sont bien définies
- Vérifier que les middlewares sont correctement importés
- Vérifier les logs pour identifier la route problématique

### 6. Erreur: "File upload failed"
**Solutions:**
- Vérifier que les dossiers `uploads/documents` et `uploads/actes` existent
- Vérifier les permissions d'écriture sur ces dossiers
- Vérifier la configuration multer dans `backend/middleware/upload.js`

### 7. Erreur: "Email sending failed"
**Solutions:**
- Vérifier les credentials email dans `.env`
- Pour Gmail, utiliser un "App Password" au lieu du mot de passe normal
- Vérifier que le port SMTP est correct (587 pour TLS)

## 📦 Déploiement sur Render.com

### Backend
1. Créer un nouveau "Web Service"
2. Connecter le repository Git
3. Configurer:
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
   - **Environment:** Node
4. Ajouter les variables d'environnement
5. Déployer

### Frontend
1. Créer un nouveau "Static Site"
2. Connecter le repository Git
3. Configurer:
   - **Build Command:** `cd frontend && npm install && npm run build`
   - **Publish Directory:** `frontend/dist`
4. Ajouter les variables d'environnement
5. Déployer

## 🐳 Déploiement avec Docker

### Backend Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install --production
COPY backend/ .
EXPOSE 5000
CMD ["node", "app.js"]
```

### Frontend Dockerfile
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🔍 Vérifications Post-Déploiement

1. **Backend:**
   - [ ] API accessible: `https://api.votre-domaine.com`
   - [ ] Health check: `https://api.votre-domaine.com/`
   - [ ] Swagger docs: `https://api.votre-domaine.com/api-docs`
   - [ ] MongoDB connecté (vérifier les logs)

2. **Frontend:**
   - [ ] Site accessible: `https://votre-domaine.com`
   - [ ] Pas d'erreurs dans la console
   - [ ] API calls fonctionnent
   - [ ] Uploads de fichiers fonctionnent

3. **Fonctionnalités:**
   - [ ] Inscription/Connexion
   - [ ] Création de déclaration
   - [ ] Upload de documents
   - [ ] Envoi d'emails
   - [ ] Génération d'actes
   - [ ] Paiement (si implémenté)

## 📝 Logs à Surveiller

```bash
# Backend logs
pm2 logs civile-backend

# Nginx logs
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log

# System logs
journalctl -u civile-backend -f
```

