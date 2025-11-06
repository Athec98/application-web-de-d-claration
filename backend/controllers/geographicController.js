const Region = require('../models/Region');
const Departement = require('../models/Departement');
const Commune = require('../models/Commune');
const CommunauteRurale = require('../models/CommunauteRurale');
const Hopital = require('../models/Hopital');

// @desc    Obtenir toutes les régions
// @route   GET /api/geographic/regions
// @access  Public
exports.getRegions = async (req, res) => {
  try {
    const regions = await Region.find({ active: true })
      .populate('departements')
      .sort({ nom: 1 });

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
};

// @desc    Obtenir tous les départements d'une région
// @route   GET /api/geographic/departements/:regionId
// @access  Public
exports.getDepartementsByRegion = async (req, res) => {
  try {
    const departements = await Departement.find({ 
      region: req.params.regionId,
      active: true 
    })
      .populate('region', 'nom code')
      .sort({ nom: 1 });

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
};

// @desc    Obtenir toutes les communes d'un département
// @route   GET /api/geographic/communes/:departementId
// @access  Public
exports.getCommunesByDepartement = async (req, res) => {
  try {
    const communes = await Commune.find({ 
      departement: req.params.departementId,
      active: true 
    })
      .populate('departement', 'nom code')
      .populate('region', 'nom code')
      .sort({ nom: 1 });

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
};

// @desc    Obtenir toutes les communautés rurales d'un département
// @route   GET /api/geographic/communaute-rurales/:departementId
// @access  Public
exports.getCommunautesRuralesByDepartement = async (req, res) => {
  try {
    const communautesRurales = await CommunauteRurale.find({ 
      departement: req.params.departementId,
      active: true 
    })
      .populate('departement', 'nom code')
      .populate('region', 'nom code')
      .sort({ nom: 1 });

    res.json({
      success: true,
      count: communautesRurales.length,
      communautesRurales
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des communautés rurales:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// @desc    Obtenir tous les hôpitaux
// @route   GET /api/geographic/hopitaux
// @access  Public
exports.getHopitaux = async (req, res) => {
  try {
    const { region, departement, delivreCertificat } = req.query;
    let query = { active: true };

    if (region) {
      query.region = region;
    }
    if (departement) {
      query.departement = departement;
    }
    if (delivreCertificat !== undefined) {
      // Le champ dans le modèle est delivreCertificatAccouchement
      query.delivreCertificatAccouchement = delivreCertificat === 'true';
    }

    const hopitaux = await Hopital.find(query)
      .populate('region', 'nom code')
      .populate('departement', 'nom code')
      .populate('commune', 'nom code')
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
};


