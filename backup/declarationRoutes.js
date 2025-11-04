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

// Routes Parent
router.post('/', protect, authorize('parent'), upload.array('documents', 10), createDeclaration);
router.get('/my-declarations', protect, authorize('parent'), getMyDeclarations);
router.put('/:id', protect, authorize('parent'), upload.array('documents', 10), updateDeclaration);

// Routes communes
router.get('/:id', protect, getDeclarationById);

// Routes Mairie
router.get('/mairie/all', protect, authorize('mairie'), getAllDeclarationsForMairie);
router.put('/:id/send-to-hospital', protect, authorize('mairie'), sendToHospital);
router.put('/:id/reject', protect, authorize('mairie'), rejectDeclaration);
router.put('/:id/generate-certificate', protect, authorize('mairie'), generateBirthCertificate);

// Routes Hôpital
router.get('/hopital/verifications', protect, authorize('hopital'), getVerificationRequests);
router.put('/:id/verify', protect, authorize('hopital'), verifyCertificate);

module.exports = router;
