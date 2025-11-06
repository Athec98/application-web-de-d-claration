# 🧪 Test Local Avant Déploiement

## ✅ Checklist de Test

### 1. Authentification
- [ ] Inscription fonctionne
- [ ] Vérification OTP fonctionne
- [ ] Connexion fonctionne
- [ ] Token stocké dans localStorage
- [ ] User stocké dans localStorage
- [ ] Déconnexion fonctionne
- [ ] Redirection après connexion fonctionne

### 2. Navigation
- [ ] Toutes les pages sont accessibles
- [ ] Les liens fonctionnent
- [ ] Les boutons de navigation fonctionnent
- [ ] Les redirections fonctionnent

### 3. Dashboard Parent
- [ ] Affichage des déclarations
- [ ] Création de déclaration
- [ ] Consultation de déclaration
- [ ] Modification de déclaration (si rejetée)
- [ ] Téléchargement d'acte (si disponible)

### 4. Dashboard Mairie
- [ ] Affichage des déclarations
- [ ] Envoi à l'hôpital
- [ ] Génération d'acte
- [ ] Archivage de dossier

### 5. Dashboard Hôpital
- [ ] Affichage des vérifications
- [ ] Validation de certificat
- [ ] Rejet de certificat

## 🚀 Commandes de Test

```bash
# 1. Installer les dépendances
cd frontend
npm install

# 2. Démarrer le backend (dans un autre terminal)
cd backend
npm run dev

# 3. Démarrer le frontend
cd frontend
npm run dev

# 4. Tester dans le navigateur
# Ouvrir http://localhost:3000
```

## ⚠️ Si Problème

1. **Vérifier les logs** dans la console du navigateur
2. **Vérifier les logs** du backend
3. **Vérifier localStorage:**
   ```javascript
   // Dans la console du navigateur
   console.log(localStorage.getItem('token'));
   console.log(localStorage.getItem('user'));
   ```

## ✅ Si Tout Fonctionne

Alors vous pouvez déployer sur Vercel en toute confiance! 🎉

