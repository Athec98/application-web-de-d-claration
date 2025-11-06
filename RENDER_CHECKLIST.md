# ✅ Checklist de Déploiement Render.com

## Configuration Backend

### Settings
- [ ] **Root Directory:** `backend` (exactement, sans slash)
- [ ] **Build Command:** `npm install`
- [ ] **Start Command:** `npm start`
- [ ] **Environment:** Node
- [ ] **Health Check Path:** `/`

### Variables d'Environnement (Environment)
- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `10000`
- [ ] `MONGODB_URI` = (votre URI MongoDB Atlas)
- [ ] `JWT_SECRET` = (votre secret JWT)
- [ ] `FRONTEND_URL` = (URL de votre frontend)
- [ ] `EMAIL_HOST` = `smtp.gmail.com` (si email activé)
- [ ] `EMAIL_USER` = (votre email)
- [ ] `EMAIL_PASS` = (votre app password)

### MongoDB Atlas
- [ ] Whitelist IP: `0.0.0.0/0` (toutes les IPs)
- [ ] URI MongoDB correcte avec username/password

## Déploiement
- [ ] Cliqué sur "Save Changes"
- [ ] Déclenché "Manual Deploy"
- [ ] Build réussi (vérifier les logs)
- [ ] Serveur démarré (vérifier les logs)

## Vérification
- [ ] Health check: `https://votre-backend.onrender.com/` → JSON OK
- [ ] API docs: `https://votre-backend.onrender.com/api-docs` → Swagger OK
- [ ] Logs: Pas d'erreurs critiques

## Frontend (après backend)
- [ ] Créé Static Site sur Render
- [ ] Build Command: `cd frontend && npm install && npm run build`
- [ ] Publish Directory: `frontend/dist`
- [ ] Variable: `VITE_API_URL=https://votre-backend.onrender.com/api`

