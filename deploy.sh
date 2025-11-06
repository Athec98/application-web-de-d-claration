#!/bin/bash

# Script de déploiement pour CIVILE-APP
# Usage: ./deploy.sh [docker|render|vercel]

set -e

DEPLOY_TYPE=${1:-docker}

echo "🚀 Déploiement de CIVILE-APP - Type: $DEPLOY_TYPE"
echo ""

case $DEPLOY_TYPE in
  docker)
    echo "📦 Déploiement avec Docker..."
    
    # Vérifier que Docker est installé
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker n'est pas installé. Veuillez l'installer d'abord."
        exit 1
    fi
    
    # Vérifier que docker-compose est installé
    if ! command -v docker-compose &> /dev/null; then
        echo "❌ Docker Compose n'est pas installé. Veuillez l'installer d'abord."
        exit 1
    fi
    
    # Vérifier le fichier .env
    if [ ! -f .env ]; then
        echo "⚠️  Fichier .env non trouvé. Création d'un template..."
        cat > .env << EOF
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/civile-app

# JWT
JWT_SECRET=changez_moi_en_production
JWT_EXPIRE=30d

# Email
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# URLs
FRONTEND_URL=http://localhost:3000
API_URL=http://localhost:5000
EOF
        echo "✅ Fichier .env créé. Veuillez le modifier avec vos valeurs."
        exit 1
    fi
    
    # Construire les images
    echo "🔨 Construction des images Docker..."
    docker-compose build
    
    # Démarrer les services
    echo "🚀 Démarrage des services..."
    docker-compose up -d
    
    # Attendre que les services soient prêts
    echo "⏳ Attente du démarrage des services..."
    sleep 10
    
    # Vérifier le statut
    echo "📊 Statut des services:"
    docker-compose ps
    
    echo ""
    echo "✅ Déploiement terminé!"
    echo "🌐 Frontend: http://localhost:3000"
    echo "🌐 Backend: http://localhost:5000"
    echo "📚 Documentation: http://localhost:5000/api-docs"
    ;;
    
  render)
    echo "☁️  Déploiement sur Render..."
    echo ""
    echo "Pour déployer sur Render:"
    echo "1. Connectez votre dépôt GitHub à Render"
    echo "2. Créez un nouveau service Web"
    echo "3. Sélectionnez le dossier 'backend'"
    echo "4. Configurez les variables d'environnement"
    echo "5. Déployez!"
    echo ""
    echo "Voir DEPLOYMENT.md pour plus de détails."
    ;;
    
  vercel)
    echo "☁️  Déploiement du frontend sur Vercel..."
    
    # Vérifier que Vercel CLI est installé
    if ! command -v vercel &> /dev/null; then
        echo "📦 Installation de Vercel CLI..."
        npm install -g vercel
    fi
    
    cd frontend
    
    # Vérifier le fichier .env.production
    if [ ! -f .env.production ]; then
        echo "⚠️  Fichier .env.production non trouvé."
        read -p "Entrez l'URL de votre backend API: " API_URL
        echo "VITE_API_URL=$API_URL" > .env.production
        echo "✅ Fichier .env.production créé."
    fi
    
    # Déployer
    echo "🚀 Déploiement sur Vercel..."
    vercel --prod
    
    echo "✅ Déploiement terminé!"
    ;;
    
  *)
    echo "❌ Type de déploiement invalide: $DEPLOY_TYPE"
    echo ""
    echo "Usage: ./deploy.sh [docker|render|vercel]"
    exit 1
    ;;
esac

