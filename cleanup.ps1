# Script de nettoyage du projet
# Ce script supprime les fichiers et dossiers inutiles

# Fonction pour supprimer en toute sécurité
function Remove-ItemSafely {
    param ([string]$path)
    
    if (Test-Path $path) {
        try {
            Remove-Item -Path $path -Recurse -Force -ErrorAction Stop
            Write-Host "Supprimé: $path" -ForegroundColor Green
        } catch {
            Write-Host "Erreur lors de la suppression de $path : $_" -ForegroundColor Red
        }
    } else {
        Write-Host "Non trouvé: $path" -ForegroundColor Yellow
    }
}

# Dossiers à nettoyer
$foldersToRemove = @(
    # Dossiers de dépendances et de build
    "node_modules",
    ".next",
    "dist",
    "build",
    "coverage",
    ".sass-cache",
    ".vscode",
    ".idea",
    "__pycache__",
    ".pytest_cache",
    
    # Dossiers de cache divers
    ".cache",
    "temp",
    "tmp"
)

# Fichiers à nettoyer
$filesToRemove = @(
    # Fichiers de verrouillage et de cache
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
    
    # Fichiers de configuration temporaires
    "*.log",
    "*.tmp",
    "*.bak",
    "*.swp",
    "*.swo",
    "*~",
    
    # Fichiers système
    ".DS_Store",
    "Thumbs.db",
    "desktop.ini"
)

Write-Host "Début du nettoyage..." -ForegroundColor Cyan

# Suppression des dossiers
foreach ($folder in $foldersToRemove) {
    Remove-ItemSafely -path $folder
}

# Suppression des fichiers
foreach ($filePattern in $filesToRemove) {
    Get-ChildItem -Path . -Recurse -Force -Include $filePattern -ErrorAction SilentlyContinue | ForEach-Object {
        Remove-ItemSafely -path $_.FullName
    }
}

Write-Host "Nettoyage terminé !" -ForegroundColor Green
Write-Host "Vous pouvez régénérer les dépendances avec 'npm install' si nécessaire." -ForegroundColor Cyan
