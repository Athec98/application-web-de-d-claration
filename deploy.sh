#!/bin/bash

# Script de déploiement pour CIVILE-APP
# Usage: ./deploy.sh [backend|frontend|all]

set -e

echo "🚀 Déploiement CIVILE-APP"
echo "=========================="

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les erreurs
error() {
    echo -e "${RED}❌ Erreur: $1${NC}"
    exit 1
}

# Fonction pour afficher les succès
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Fonction pour afficher les warnings
warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Vérifier que Node.js est installé
if ! command -v node &> /dev/null; then
    error "Node.js n'est pas installé"
fi

# Vérifier que npm est installé
if ! command -v npm &> /dev/null; then
    error "npm n'est pas installé"
fi

# Fonction pour déployer le backend
deploy_backend() {
    echo ""
    echo "📦 Déploiement du Backend..."
    
    cd backend
    
    # Vérifier que .env existe
    if [ ! -f .env ]; then
        warning ".env n'existe pas, création depuis .env.example..."
        if [ -f .env.example ]; then
            cp .env.example .env
            warning "⚠️  Veuillez configurer les variables dans backend/.env"
        else
            error ".env.example n'existe pas"
        fi
    fi
    
    # Installer les dépendances
    echo "📥 Installation des dépendances..."
    npm install --production || error "Échec de l'installation des dépendances"
    
    # Créer les dossiers nécessaires
    echo "📁 Création des dossiers..."
    mkdir -p uploads/documents uploads/actes-naissance logs
    
    # Vérifier la connexion MongoDB
    echo "🔌 Vérification de la connexion MongoDB..."
    node -e "require('dotenv').config(); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => { console.log('✅ MongoDB connecté'); process.exit(0); }).catch(err => { console.error('❌ Erreur MongoDB:', err.message); process.exit(1); });" || warning "Impossible de vérifier MongoDB, mais le déploiement continue..."
    
    success "Backend prêt pour le déploiement"
    cd ..
}

# Fonction pour déployer le frontend
deploy_frontend() {
    echo ""
    echo "📦 Déploiement du Frontend..."
    
    cd frontend
    
    # Vérifier que .env existe
    if [ ! -f .env ]; then
        warning ".env n'existe pas, création depuis .env.example..."
        if [ -f .env.example ]; then
            cp .env.example .env
            warning "⚠️  Veuillez configurer VITE_API_URL dans frontend/.env"
        fi
    fi
    
    # Installer les dépendances
    echo "📥 Installation des dépendances..."
    npm install || error "Échec de l'installation des dépendances"
    
    # Build
    echo "🔨 Build de l'application..."
    npm run build || error "Échec du build"
    
    # Vérifier que dist/ existe
    if [ ! -d "dist" ]; then
        error "Le dossier dist/ n'a pas été créé"
    fi
    
    success "Frontend buildé avec succès dans frontend/dist/"
    cd ..
}

# Fonction pour déployer avec Docker
deploy_docker() {
    echo ""
    echo "🐳 Déploiement avec Docker..."
    
    # Vérifier que Docker est installé
    if ! command -v docker &> /dev/null; then
        error "Docker n'est pas installé"
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        error "docker-compose n'est pas installé"
    fi
    
    # Vérifier que .env existe
    if [ ! -f .env ]; then
        warning ".env n'existe pas à la racine"
        warning "Créez un fichier .env avec les variables nécessaires"
    fi
    
    # Build et démarrer les conteneurs
    echo "🔨 Build des images Docker..."
    docker-compose build || error "Échec du build Docker"
    
    echo "🚀 Démarrage des conteneurs..."
    docker-compose up -d || error "Échec du démarrage des conteneurs"
    
    success "Application déployée avec Docker"
    echo "Backend: http://localhost:5000"
    echo "Frontend: http://localhost:3000"
}

# Main
case "${1:-all}" in
    backend)
        deploy_backend
        ;;
    frontend)
        deploy_frontend
        ;;
    docker)
        deploy_docker
        ;;
    all)
        deploy_backend
        deploy_frontend
        success "✅ Déploiement terminé!"
        echo ""
        echo "📝 Prochaines étapes:"
        echo "1. Configurez les variables d'environnement dans backend/.env et frontend/.env"
        echo "2. Démarrez le backend: cd backend && npm start"
        echo "3. Servez le frontend: cd frontend/dist && serve -s . -l 3000"
        echo "   ou utilisez Nginx (voir DEPLOYMENT.md)"
        ;;
    *)
        echo "Usage: ./deploy.sh [backend|frontend|docker|all]"
        exit 1
        ;;
esac
