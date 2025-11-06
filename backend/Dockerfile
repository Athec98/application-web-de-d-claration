# Dockerfile pour le backend CIVILE-APP
FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances du backend
COPY backend/package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le reste des fichiers de l'application backend
COPY backend/ .

# Créer les répertoires nécessaires
RUN mkdir -p uploads/documents uploads/actes-naissance logs

# Exposer le port
EXPOSE 5000

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=5000
ENV HOST=0.0.0.0

# Commande de démarrage
CMD ["node", "app.js"]

