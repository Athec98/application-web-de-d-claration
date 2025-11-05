const Mairie = require('../models/Mairie');

// @desc    Obtenir toutes les mairies
// @route   GET /api/mairies
// @access  Public
exports.getMairies = async (req, res) => {
  try {
    const { region, departement, commune } = req.query;
    let query = { active: true };

    if (region) {
      query.region = region;
    }
    if (departement) {
      query.departement = departement;
    }
    if (commune) {
      query.commune = commune;
    }

    const mairies = await Mairie.find(query)
      .populate('region departement commune communauteRurale')
      .sort({ nom: 1 });

    res.json({
      success: true,
      count: mairies.length,
      mairies
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des mairies:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// @desc    Obtenir une mairie par ID
// @route   GET /api/mairies/:id
// @access  Public
exports.getMairieById = async (req, res) => {
  try {
    const mairie = await Mairie.findById(req.params.id)
      .populate('region departement commune communauteRurale');

    if (!mairie) {
      return res.status(404).json({
        success: false,
        message: 'Mairie non trouvée'
      });
    }

    res.json({
      success: true,
      mairie
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la mairie:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// @desc    Obtenir les mairies d'une région
// @route   GET /api/mairies/region/:regionId
// @access  Public
exports.getMairiesByRegion = async (req, res) => {
  try {
    const mairies = await Mairie.find({ 
      region: req.params.regionId,
      active: true 
    })
      .populate('region departement commune communauteRurale')
      .sort({ nom: 1 });

    res.json({
      success: true,
      count: mairies.length,
      mairies
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des mairies:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// @desc    Obtenir les mairies d'un département
// @route   GET /api/mairies/departement/:departementId
// @access  Public
exports.getMairiesByDepartement = async (req, res) => {
  try {
    const mairies = await Mairie.find({ 
      departement: req.params.departementId,
      active: true 
    })
      .populate('region departement commune communauteRurale')
      .sort({ nom: 1 });

    res.json({
      success: true,
      count: mairies.length,
      mairies
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des mairies:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

