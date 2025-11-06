# Résolution des Problèmes de Déploiement

## 🔴 Problèmes Critiques

### 1. "Cannot find module 'X'"
**Cause:** Dépendances manquantes ou mal installées

**Solution:**
```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### 2. "Port already in use"
**Cause:** Un autre processus utilise le port

**Solution Windows:**
```powershell
# Trouver le processus
netstat -ano | findstr :5000

# Tuer le processus (remplacer PID)
taskkill /PID <PID> /F
```

**Solution Linux/Mac:**
```bash
# Trouver le processus
lsof -i :5000

# Tuer le processus
kill -9 <PID>
```

### 3. "MongoDB connection failed"
**Causes possibles:**
- URI MongoDB incorrecte
- IP non whitelistée dans MongoDB Atlas
- Credentials incorrects

**Solutions:**
1. Vérifier `MONGODB_URI` dans `backend/.env`
2. Dans MongoDB Atlas → Network Access → Add IP Address
   - Pour développement: `0.0.0.0/0` (toutes les IPs)
   - Pour production: IP spécifique du serveur
3. Vérifier username/password dans l'URI

### 4. "CORS policy: No 'Access-Control-Allow-Origin'"
**Cause:** Frontend et backend sur des domaines différents

**Solutions:**
1. Ajouter l'URL du frontend dans `backend/.env`:
   ```env
   FRONTEND_URL=https://votre-domaine.com
   ```
2. Vérifier `backend/app.js` - la configuration CORS doit inclure cette URL
3. En développement local, autoriser `http://localhost:3000`

### 5. "Build failed" (Frontend)
**Causes possibles:**
- Erreurs TypeScript
- Variables d'environnement manquantes
- Dépendances incompatibles

**Solutions:**
```bash
cd frontend
npm run build
# Lire les erreurs et corriger
```

### 6. "File upload failed"
**Causes:**
- Dossiers uploads/ non créés
- Permissions insuffisantes
- Configuration multer incorrecte

**Solutions:**
```bash
# Créer les dossiers
cd backend
mkdir -p uploads/documents
mkdir -p uploads/actes-naissance

# Vérifier les permissions (Linux)
chmod 755 uploads
chmod 755 uploads/documents
chmod 755 uploads/actes-naissance
```

### 7. "Email sending failed"
**Causes:**
- Credentials email incorrects
- Port SMTP bloqué
- Gmail nécessite "App Password"

**Solutions:**
1. Pour Gmail:
   - Activer "2-Step Verification"
   - Générer un "App Password"
   - Utiliser cet App Password dans `EMAIL_PASS`
2. Vérifier les variables:
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=votre-email@gmail.com
   EMAIL_PASS=votre-app-password
   ```

## 🟡 Problèmes de Performance

### 8. "Application slow"
**Solutions:**
- Activer le cache Nginx
- Optimiser les requêtes MongoDB (indexes)
- Utiliser PM2 pour le backend
- Compresser les assets (gzip)

### 9. "Memory leak"
**Solutions:**
- Vérifier les logs pour les fuites
- Utiliser PM2 avec limite mémoire
- Optimiser les requêtes MongoDB

## 🟢 Problèmes de Configuration

### 10. "Environment variables not loaded"
**Solution:**
- Vérifier que `.env` existe
- Vérifier le format (pas d'espaces autour de `=`)
- Redémarrer le serveur après modification

### 11. "Routes not found (404)"
**Causes:**
- Routes mal configurées
- Proxy mal configuré (Nginx)
- Base path incorrect

**Solutions:**
- Vérifier `backend/routes/`
- Vérifier la configuration Nginx
- Vérifier `VITE_API_URL` dans frontend

### 12. "Static files not loading"
**Solutions:**
- Vérifier que `frontend/dist/` existe
- Vérifier la configuration Nginx
- Vérifier les chemins dans `index.html`

## 📋 Checklist de Vérification

Avant de déployer, vérifiez:

- [ ] `.env` configuré dans `backend/`
- [ ] `.env` configuré dans `frontend/`
- [ ] `MONGODB_URI` valide et accessible
- [ ] `JWT_SECRET` défini et sécurisé
- [ ] `FRONTEND_URL` correspond à l'URL réelle
- [ ] Dossiers `uploads/` créés
- [ ] Ports disponibles (5000 pour backend, 3000 pour frontend)
- [ ] Toutes les dépendances installées
- [ ] Build frontend réussi
- [ ] MongoDB whitelist configurée
- [ ] Email configuré (si nécessaire)

## 🆘 Support

Si le problème persiste:
1. Vérifier les logs: `pm2 logs` ou `docker logs`
2. Vérifier la console du navigateur
3. Vérifier les logs backend dans `backend/logs/`
4. Tester les endpoints API avec Postman/curl

