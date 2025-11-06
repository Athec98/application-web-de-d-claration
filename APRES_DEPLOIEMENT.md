# ✅ Après le Déploiement Render.com

## 📊 Pendant le Déploiement

### Surveiller les Logs

1. Allez dans l'onglet **"Logs"** dans Render Dashboard
2. Vous devriez voir:
   ```
   Installing dependencies...
   npm install
   ```
3. Puis:
   ```
   Starting...
   npm start
   ```
4. Enfin:
   ```
   🚀 Serveur démarré sur le port 10000
   MongoDB connected successfully
   ```

### ⏱️ Temps Attendu

- **Build:** 1-2 minutes
- **Start:** 30 secondes
- **Total:** 2-3 minutes

## ✅ Vérifications Post-Déploiement

### 1. Health Check

Ouvrez dans votre navigateur:
```
https://votre-backend.onrender.com/
```

**Résultat attendu:**
```json
{
  "message": "🇸🇳 API CIVILE-APP",
  "version": "1.0.0",
  "status": "active",
  "documentation": "/api-docs"
}
```

### 2. API Documentation

Ouvrez:
```
https://votre-backend.onrender.com/api-docs
```

**Résultat attendu:** Interface Swagger avec toutes les routes API

### 3. Test de Connexion MongoDB

Dans les logs, vous devriez voir:
```
✅ MongoDB connected successfully to: ...
```

Si vous voyez une erreur MongoDB:
- Vérifiez `MONGODB_URI` dans les variables d'environnement
- Vérifiez la whitelist IP dans MongoDB Atlas (ajouter `0.0.0.0/0`)

## 🎯 Prochaines Étapes

### 1. Déployer le Frontend

Créez un **nouveau Static Site** sur Render:

```
Name: civile-app-frontend
Build Command: cd frontend && npm install && npm run build
Publish Directory: frontend/dist
```

**Variable d'environnement:**
```
VITE_API_URL=https://votre-backend.onrender.com/api
```

### 2. Tester l'Application Complète

1. **Inscription:** Créer un compte parent
2. **Connexion:** Se connecter
3. **Déclaration:** Créer une déclaration de naissance
4. **Upload:** Tester l'upload de documents

### 3. Configurer les Agents

Créez des comptes pour:
- Agent Mairie
- Agent Hôpital

Utilisez les scripts dans `backend/scripts/`:
- `createAgentMairie.js`
- `createAgentHopital.js`

## 🔍 Dépannage

### Si le déploiement échoue

1. **Vérifiez les logs** pour l'erreur exacte
2. **Vérifiez Root Directory** = `backend`
3. **Vérifiez les variables d'environnement**
4. **Vérifiez MongoDB URI**

### Si le serveur ne démarre pas

1. Vérifiez les logs pour les erreurs
2. Vérifiez que `PORT` est défini (Render le définit automatiquement)
3. Vérifiez la connexion MongoDB

### Si CORS error

1. Ajoutez `FRONTEND_URL` avec l'URL exacte du frontend
2. Redéployez le backend

## 📝 Checklist Post-Déploiement

- [ ] Backend accessible sur `https://votre-backend.onrender.com/`
- [ ] Health check retourne JSON
- [ ] API docs accessible
- [ ] MongoDB connecté (vérifier les logs)
- [ ] Pas d'erreurs dans les logs
- [ ] Frontend déployé (si applicable)
- [ ] Variables d'environnement configurées
- [ ] Test de connexion réussi

## 🎉 Félicitations!

Votre backend est maintenant déployé sur Render.com! 🚀

