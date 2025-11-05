# Dépendances à installer

## 📦 Frontend (dans le dossier `frontend/`)

Exécutez ces commandes dans le dossier `frontend` :

```bash
cd frontend
npm install http-proxy-middleware express ip --save
npm install @types/express @types/ip --save-dev
npm install @tanstack/react-query-devtools --save
```

### Packages à installer :
- `http-proxy-middleware` (dépendance)
- `express` (dépendance)
- `ip` (dépendance)
- `@tanstack/react-query-devtools` (dépendance) - **NOUVEAU**
- `@types/express` (devDependency)
- `@types/ip` (devDependency)

---

## 📦 Backend (dans le dossier `backend/`)

Le backend devrait déjà avoir toutes ses dépendances. Si besoin, exécutez :

```bash
cd backend
npm install
```

---

## 📦 Racine du projet (pour lancer les deux serveurs)

Exécutez dans la racine du projet :

```bash
npm install concurrently --save-dev
```

### Package à installer :
- `concurrently` (devDependency) - Pour lancer frontend et backend simultanément

---

## 🚀 Après installation, utilisez :

### Pour lancer seulement le frontend :
```bash
cd frontend
npm run dev
```

### Pour lancer seulement le backend :
```bash
cd backend
npm run dev
```

### Pour lancer les deux en même temps (depuis la racine) :
```bash
npm run dev:all
```

Cela lancera les deux serveurs avec des logs colorés et séparés.
