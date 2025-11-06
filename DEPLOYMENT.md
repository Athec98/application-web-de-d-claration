# Guide de Déploiement - Application État Civil Sénégal

## Prérequis

1. **Node.js** (version 18 ou supérieure)
2. **MongoDB Atlas** ou MongoDB local
3. **Variables d'environnement** configurées

## Configuration des Variables d'Environnement

### Backend (.env dans `backend/`)

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/civile-app?retryWrites=true&w=majority

# JWT
JWT_SECRET=votre_secret_jwt_tres_securise
JWT_EXPIRE=30d

# Serveur
PORT=5000
NODE_ENV=production
HOST=0.0.0.0

# Frontend URL (pour CORS)
FRONTEND_URL=https://votre-domaine.com

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre-email@gmail.com
EMAIL_PASS=votre-mot-de-passe-app
EMAIL_FROM=noreply@etatcivil.sn
```

### Frontend (.env dans `frontend/`)

```env
VITE_API_URL=https://api.votre-domaine.com/api
```

## Étapes de Déploiement

### 1. Préparation du Backend

```bash
cd backend
npm install --production
```

### 2. Préparation du Frontend

```bash
cd frontend
npm install
npm run build
```

Le dossier `dist/` sera créé avec les fichiers statiques.

### 3. Création des Dossiers Nécessaires

```bash
# Dans backend/
mkdir -p uploads/documents
mkdir -p uploads/actes
```

### 4. Déploiement Backend (Node.js/Express)

#### Option A: PM2 (Recommandé)

```bash
npm install -g pm2
cd backend
pm2 start app.js --name civile-backend
pm2 save
pm2 startup
```

#### Option B: Systemd (Linux)

Créer `/etc/systemd/system/civile-backend.service`:

```ini
[Unit]
Description=CIVILE-APP Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/APPLICATION/backend
ExecStart=/usr/bin/node app.js
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Puis:
```bash
sudo systemctl enable civile-backend
sudo systemctl start civile-backend
```

### 5. Déploiement Frontend

#### Option A: Nginx (Recommandé)

Configuration `/etc/nginx/sites-available/civile-app`:

```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    # Redirection HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name votre-domaine.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Frontend
    root /path/to/APPLICATION/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Backend
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Fichiers uploadés
    location /uploads {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # Fichiers statiques
    location /assets {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Option B: Serveur Node.js simple

Créer `server.js` à la racine:

```javascript
const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'frontend/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Frontend server running on port ${PORT}`);
});
```

### 6. Configuration CORS pour Production

Mettre à jour `backend/app.js`:

```javascript
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://votre-domaine.com',
  'https://www.votre-domaine.com'
];
```

## Vérifications Post-Déploiement

1. ✅ Backend accessible sur `https://api.votre-domaine.com`
2. ✅ Frontend accessible sur `https://votre-domaine.com`
3. ✅ MongoDB connecté
4. ✅ Uploads de fichiers fonctionnels
5. ✅ Emails envoyés correctement
6. ✅ HTTPS configuré

## Problèmes Courants

### Erreur: Cannot find module
```bash
cd backend && npm install
cd ../frontend && npm install
```

### Erreur: Port already in use
```bash
# Trouver le processus
lsof -i :5000
# Tuer le processus
kill -9 <PID>
```

### Erreur: MongoDB connection failed
- Vérifier l'URI MongoDB
- Vérifier la whitelist IP dans MongoDB Atlas
- Vérifier les credentials

### Erreur: CORS
- Vérifier `FRONTEND_URL` dans `.env`
- Vérifier la configuration CORS dans `backend/app.js`

## Scripts Utiles

### Backup MongoDB
```bash
mongodump --uri="MONGODB_URI" --out=./backup
```

### Restart Services
```bash
# PM2
pm2 restart civile-backend

# Systemd
sudo systemctl restart civile-backend
```

## Monitoring

### PM2 Monitoring
```bash
pm2 monit
pm2 logs civile-backend
```

### Logs
```bash
# Backend logs
tail -f backend/logs/audit.log

# PM2 logs
pm2 logs
```
