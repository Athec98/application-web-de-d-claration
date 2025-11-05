const express = require('express');
const router = express.Router();
const mairieController = require('../controllers/mairieController');

// @route   GET /api/mairies
// @desc    Obtenir toutes les mairies
// @access  Public
router.get('/', mairieController.getMairies);

// IMPORTANT: Les routes spécifiques doivent être définies AVANT les routes génériques /:id
// @route   GET /api/mairies/region/:regionId
// @desc    Obtenir les mairies d'une région
// @access  Public
router.get('/region/:regionId', mairieController.getMairiesByRegion);

// @route   GET /api/mairies/departement/:departementId
// @desc    Obtenir les mairies d'un département
// @access  Public
router.get('/departement/:departementId', mairieController.getMairiesByDepartement);

// @route   GET /api/mairies/:id
// @desc    Obtenir une mairie par ID
// @access  Public
router.get('/:id', mairieController.getMairieById);

module.exports = router;

