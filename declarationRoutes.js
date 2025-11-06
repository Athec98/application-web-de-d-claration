const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  createDeclaration,
  getMyDeclarations,
  getDeclarationById,
  updateDeclaration,
  getAllDeclarationsForMairie,
  sendToHospital,
  rejectDeclaration,
  getVerificationRequests,
  verifyCertificate,
  generateBirthCertificate
} = require('../controllers/declarationController');
const { protect, authorize } = require('../middleware/auth');

// Configuration de multer pour l'upload de fichiers
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/documents/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Seuls les fichiers PDF, JPG et PNG sont autorisés'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: fileFilter
});

// IMPORTANT: Les routes spécifiques doivent être définies AVANT les routes avec paramètres
// Sinon, Express.js peut capturer "my-declarations" comme un :id

// Routes Parent - Routes spécifiques
router.post('/', protect, authorize('parent'), upload.array('documents', 10), createDeclaration);
router.get('/my-declarations', protect, authorize('parent'), getMyDeclarations);

// Routes Mairie - Routes spécifiques
router.get('/mairie/all', protect, authorize('mairie'), getAllDeclarationsForMairie);

// Routes Hôpital - Routes spécifiques
router.get('/hopital/verifications', protect, authorize('hopital'), getVerificationRequests);

// Routes avec paramètres spécifiques (doivent être avant la route générique /:id)
router.put('/:id/send-to-hospital', protect, authorize('mairie'), sendToHospital);
router.put('/:id/reject', protect, authorize('mairie'), rejectDeclaration);
router.put('/:id/generate-certificate', protect, authorize('mairie'), generateBirthCertificate);
router.put('/:id/verify', protect, authorize('hopital'), verifyCertificate);
router.put('/:id', protect, authorize('parent'), upload.array('documents', 10), updateDeclaration);

// Route générique (doit être en dernier)
router.get('/:id', protect, getDeclarationById);

module.exports = router;
