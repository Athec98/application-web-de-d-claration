const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Region = require('../models/Region');
const Departement = require('../models/Departement');
const Commune = require('../models/Commune');
const CommunauteRurale = require('../models/CommunauteRurale');
const Hopital = require('../models/Hopital');

// @route   GET /api/references/regions
// @desc    Obtenir toutes les régions
// @access  Public
router.get('/regions', async (req, res) => {
  try {
    const regions = await Region.find({ active: true }).sort({ nom: 1 });
    res.json({
      success: true,
      count: regions.length,
      regions
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des régions:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
});

// @route   GET /api/references/departements
// @desc    Obtenir les départements d'une région
// @access  Public
router.get('/departements/:regionId', async (req, res) => {
  try {
    const departements = await Departement.find({ 
      region: req.params.regionId,
      active: true 
    }).sort({ nom: 1 });
    
    res.json({
      success: true,
      count: departements.length,
      departements
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des départements:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
});

// @route   GET /api/references/communes
// @desc    Obtenir les communes d'un département
// @access  Public
router.get('/communes/:departementId', async (req, res) => {
  try {
    const communes = await Commune.find({ 
      departement: req.params.departementId,
      active: true 
    }).sort({ nom: 1 });
    
    res.json({
      success: true,
      count: communes.length,
      communes
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des communes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
});

// @route   GET /api/references/communautes-rurales
// @desc    Obtenir les communautés rurales d'un département
// @access  Public
router.get('/communautes-rurales/:departementId', async (req, res) => {
  try {
    const communautes = await CommunauteRurale.find({ 
      departement: req.params.departementId,
      active: true 
    }).sort({ nom: 1 });
    
    res.json({
      success: true,
      count: communautes.length,
      communautesRurales: communautes
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des communautés rurales:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
});

// @route   GET /api/references/hopitaux
// @desc    Obtenir tous les hôpitaux (filtrés par région/département si fourni)
// @access  Public
router.get('/hopitaux', async (req, res) => {
  try {
    let query = { active: true, delivreCertificatAccouchement: true };
    
    if (req.query.region) {
      query.region = req.query.region;
    }
    if (req.query.departement) {
      query.departement = req.query.departement;
    }

    const hopitaux = await Hopital.find(query)
      .populate('region departement commune')
      .sort({ nom: 1 });
    
    res.json({
      success: true,
      count: hopitaux.length,
      hopitaux
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des hôpitaux:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
});

module.exports = router;

