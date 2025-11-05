const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { auth } = require('../middleware/auth');
const declarationController = require('../controllers/declarationController');

// @route   POST /api/declarations
// @desc    Créer une nouvelle déclaration (avec vérification des doublons)
// @access  Private (Parent)
router.post(
  '/',
  [
    auth,
    [
      check('nomEnfant', 'Le nom de l\'enfant est requis').not().isEmpty(),
      check('prenomEnfant', 'Le prénom de l\'enfant est requis').not().isEmpty(),
      check('dateNaissance', 'La date de naissance est requise').not().isEmpty(),
      check('lieuNaissance', 'Le lieu de naissance est requis').not().isEmpty(),
      check('sexe', 'Le sexe est requis').not().isEmpty(),
      check('nomPere', 'Le nom du père est requis').not().isEmpty(),
      check('nomMere', 'Le nom de la mère est requis').not().isEmpty(),
      check('region', 'La région est requise').not().isEmpty(),
      check('departement', 'Le département est requis').not().isEmpty(),
      check('mairie', 'La mairie est requise').not().isEmpty(),
      check('certificatAccouchement.numero', 'Le numéro du certificat d\'accouchement est requis').not().isEmpty(),
      check('certificatAccouchement.dateDelivrance', 'La date de délivrance du certificat est requise').not().isEmpty()
    ]
  ],
  declarationController.createDeclaration
);

// @route   GET /api/declarations
// @desc    Obtenir toutes les déclarations (filtrées selon le rôle)
// @access  Private
router.get('/', auth, declarationController.getDeclarations);

// IMPORTANT: Les routes spécifiques doivent être définies AVANT les routes génériques /:id
// @route   GET /api/declarations/:id/suggested-hospitals
// @desc    Obtenir les hôpitaux suggérés pour une déclaration
// @access  Private (Mairie)
router.get('/:id/suggested-hospitals', auth, declarationController.getSuggestedHospitals);

// @route   GET /api/declarations/:id
// @desc    Obtenir une déclaration par ID
// @access  Private
router.get('/:id', auth, declarationController.getDeclarationById);

// @route   PUT /api/declarations/:id/send-to-hospital
// @desc    Mairie : Envoyer la déclaration à l'hôpital
// @access  Private (Mairie)
router.put('/:id/send-to-hospital', auth, declarationController.sendToHospital);

// @route   PUT /api/declarations/:id/reject
// @desc    Mairie : Rejeter une déclaration
// @access  Private (Mairie)
router.put('/:id/reject', auth, declarationController.rejectDeclaration);

// @route   PUT /api/declarations/:id/validate-certificate
// @desc    Hôpital : Valider le certificat d'accouchement
// @access  Private (Hôpital)
router.put('/:id/validate-certificate', auth, declarationController.validateCertificate);

// @route   PUT /api/declarations/:id/reject-certificate
// @desc    Hôpital : Rejeter le certificat d'accouchement
// @access  Private (Hôpital)
router.put('/:id/reject-certificate', auth, declarationController.rejectCertificate);

module.exports = router;
