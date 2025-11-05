const express = require('express');
const router = express.Router();
const geographicController = require('../controllers/geographicController');

// @route   GET /api/geographic/regions
// @desc    Obtenir toutes les régions
// @access  Public
router.get('/regions', geographicController.getRegions);

// @route   GET /api/geographic/departements/:regionId
// @desc    Obtenir tous les départements d'une région
// @access  Public
router.get('/departements/:regionId', geographicController.getDepartementsByRegion);

// @route   GET /api/geographic/communes/:departementId
// @desc    Obtenir toutes les communes d'un département
// @access  Public
router.get('/communes/:departementId', geographicController.getCommunesByDepartement);

// @route   GET /api/geographic/communaute-rurales/:departementId
// @desc    Obtenir toutes les communautés rurales d'un département
// @access  Public
router.get('/communaute-rurales/:departementId', geographicController.getCommunautesRuralesByDepartement);

// @route   GET /api/geographic/hopitaux
// @desc    Obtenir tous les hôpitaux
// @access  Public
router.get('/hopitaux', geographicController.getHopitaux);

module.exports = router;


