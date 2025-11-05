const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const acteNaissanceController = require('../controllers/acteNaissanceController');

// @route   POST /api/actes-naissance/generate/:declarationId
// @desc    Générer un acte de naissance
// @access  Private (Mairie)
router.post('/generate/:declarationId', auth, acteNaissanceController.generateActeNaissance);

// @route   GET /api/actes-naissance/:id
// @desc    Obtenir un acte de naissance
// @access  Private
router.get('/:id', auth, acteNaissanceController.getActeNaissance);

// @route   POST /api/actes-naissance/:id/payment
// @desc    Initier le paiement et téléchargement
// @access  Private (Parent)
router.post('/:id/payment', auth, acteNaissanceController.initiatePayment);

// @route   POST /api/actes-naissance/payment/confirm/:reference
// @desc    Confirmer le paiement et télécharger
// @access  Private (Parent)
router.post('/payment/confirm/:reference', auth, acteNaissanceController.confirmPaymentAndDownload);

// @route   GET /api/actes-naissance/download/:id
// @desc    Télécharger l'acte de naissance (après paiement)
// @access  Private (Parent)
router.get('/download/:id', auth, acteNaissanceController.downloadActeNaissance);

module.exports = router;

