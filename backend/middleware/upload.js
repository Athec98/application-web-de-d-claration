const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Créer le dossier uploads/documents s'il n'existe pas
const uploadsDir = path.join(__dirname, '../uploads/documents');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuration du stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Générer un nom de fichier unique : timestamp-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

// Filtre des types de fichiers acceptés
const fileFilter = (req, file, cb) => {
  // Accepter les images et PDF
  const allowedTypes = /jpeg|jpg|png|gif|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé. Seuls les fichiers JPEG, JPG, PNG, GIF et PDF sont acceptés.'));
  }
};

// Configuration de multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max par fichier
  },
  fileFilter: fileFilter
});

// Middleware pour uploader plusieurs fichiers avec des noms de champs spécifiques
const uploadDocuments = upload.fields([
  { name: 'certificatAccouchement', maxCount: 1 },
  { name: 'idPere', maxCount: 1 },
  { name: 'idMere', maxCount: 1 },
  { name: 'autres', maxCount: 5 } // Permettre plusieurs fichiers "autres"
]);

module.exports = {
  uploadDocuments,
  upload
};

