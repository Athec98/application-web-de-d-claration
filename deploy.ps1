# Script de déploiement PowerShell pour CIVILE-APP
# Usage: .\deploy.ps1 [docker|render|vercel]

param(
    [Parameter(Position=0)]
    [ValidateSet("docker", "render", "vercel")]
    [string]$DeployType = "docker"
)

Write-Host "🚀 Déploiement de CIVILE-APP - Type: $DeployType" -ForegroundColor Cyan
Write-Host ""

switch ($DeployType) {
    "docker" {
        Write-Host "📦 Déploiement avec Docker..." -ForegroundColor Yellow
        
        # Vérifier que Docker est installé
        if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
            Write-Host "❌ Docker n'est pas installé. Veuillez l'installer d'abord." -ForegroundColor Red
            exit 1
        }
        
        # Vérifier que docker-compose est installé
        if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
            Write-Host "❌ Docker Compose n'est pas installé. Veuillez l'installer d'abord." -ForegroundColor Red
            exit 1
        }
        
        # Vérifier le fichier .env
        if (-not (Test-Path ".env")) {
            Write-Host "⚠️  Fichier .env non trouvé. Création d'un template..." -ForegroundColor Yellow
            @"
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
"@ | Out-File -FilePath ".env" -Encoding UTF8
            Write-Host "✅ Fichier .env créé. Veuillez le modifier avec vos valeurs." -ForegroundColor Green
            exit 1
        }
        
        # Construire les images
        Write-Host "🔨 Construction des images Docker..." -ForegroundColor Yellow
        docker-compose build
        
        # Démarrer les services
        Write-Host "🚀 Démarrage des services..." -ForegroundColor Yellow
        docker-compose up -d
        
        # Attendre que les services soient prêts
        Write-Host "⏳ Attente du démarrage des services..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
        
        # Vérifier le statut
        Write-Host "📊 Statut des services:" -ForegroundColor Yellow
        docker-compose ps
        
        Write-Host ""
        Write-Host "✅ Déploiement terminé!" -ForegroundColor Green
        Write-Host "🌐 Frontend: http://localhost:3000" -ForegroundColor Cyan
        Write-Host "🌐 Backend: http://localhost:5000" -ForegroundColor Cyan
        Write-Host "📚 Documentation: http://localhost:5000/api-docs" -ForegroundColor Cyan
    }
    
    "render" {
        Write-Host "☁️  Déploiement sur Render..." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Pour déployer sur Render:" -ForegroundColor Cyan
        Write-Host "1. Connectez votre dépôt GitHub à Render"
        Write-Host "2. Créez un nouveau service Web"
        Write-Host "3. Sélectionnez le dossier 'backend'"
        Write-Host "4. Configurez les variables d'environnement"
        Write-Host "5. Déployez!"
        Write-Host ""
        Write-Host "Voir DEPLOYMENT.md pour plus de détails." -ForegroundColor Cyan
    }
    
    "vercel" {
        Write-Host "☁️  Déploiement du frontend sur Vercel..." -ForegroundColor Yellow
        
        # Vérifier que Vercel CLI est installé
        if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
            Write-Host "📦 Installation de Vercel CLI..." -ForegroundColor Yellow
            npm install -g vercel
        }
        
        Set-Location frontend
        
        # Vérifier le fichier .env.production
        if (-not (Test-Path ".env.production")) {
            Write-Host "⚠️  Fichier .env.production non trouvé." -ForegroundColor Yellow
            $apiUrl = Read-Host "Entrez l'URL de votre backend API"
            "VITE_API_URL=$apiUrl" | Out-File -FilePath ".env.production" -Encoding UTF8
            Write-Host "✅ Fichier .env.production créé." -ForegroundColor Green
        }
        
        # Déployer
        Write-Host "🚀 Déploiement sur Vercel..." -ForegroundColor Yellow
        vercel --prod
        
        Write-Host "✅ Déploiement terminé!" -ForegroundColor Green
    }
}

