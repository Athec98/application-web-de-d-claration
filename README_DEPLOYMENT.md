# 🚀 Guide de Déploiement Rapide - CIVILE-APP

## Options de déploiement

### 1. 🐳 Déploiement avec Docker (Recommandé pour développement/test)

**Prérequis**: Docker et Docker Compose installés

```bash
# Windows PowerShell
.\deploy.ps1 docker

# Linux/Mac
./deploy.sh docker
```

Ou manuellement:
```bash
docker-compose build
docker-compose up -d
```

**Accès:**
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- API Docs: http://localhost:5000/api-docs

### 2. ☁️ Déploiement sur Render (Backend)

1. Connectez votre dépôt GitHub à Render
2. Créez un nouveau service Web
3. Sélectionnez le dossier `backend`
4. Configurez les variables d'environnement (voir ci-dessous)
5. Déployez!

**Configuration Render:**
- Build Command: `npm install`
- Start Command: `npm start`
- Environment: `Node`

### 3. ☁️ Déploiement sur Vercel (Frontend)

1. Connectez votre dépôt GitHub à Vercel
2. Sélectionnez le dossier `frontend`
3. Vercel détectera automatiquement Vite
4. Configurez `VITE_API_URL` avec l'URL de votre backend
5. Déployez!

## 📝 Variables d'environnement requises

### Backend (.env)

```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=votre_secret_jwt
JWT_EXPIRE=30d
EMAIL_USER=votre_email@gmail.com
EMAIL_PASS=mot_de_passe_application
FRONTEND_URL=https://votre-frontend.vercel.app
API_URL=https://votre-backend.onrender.com
NODE_ENV=production
PORT=5000
HOST=0.0.0.0
```

### Frontend (.env.production)

```env
VITE_API_URL=https://votre-backend.onrender.com
```

## 📚 Documentation complète

Voir [DEPLOYMENT.md](./DEPLOYMENT.md) pour le guide complet avec tous les détails.

## ✅ Vérification après déploiement

1. **Backend**: Vérifiez http://votre-backend.onrender.com/api-docs
2. **Frontend**: Ouvrez l'URL de déploiement et testez la connexion
3. **Logs**: Vérifiez les logs dans les dashboards Render/Vercel

## 🆘 Support

En cas de problème, consultez la section "Dépannage" dans [DEPLOYMENT.md](./DEPLOYMENT.md).

