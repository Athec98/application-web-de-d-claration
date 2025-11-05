const Declaration = require('../models/Declaration');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Mairie = require('../models/Mairie');
const Hopital = require('../models/Hopital');

// Créer une notification
const createNotification = async (userId, type, titre, message, declarationId = null) => {
  try {
    const notification = new Notification({
      user: userId,
      type,
      titre,
      message,
      declaration: declarationId
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Erreur lors de la création de la notification:', error);
    return null;
  }
};

// Vérifier les doublons
const checkDuplicate = async (declarationData) => {
  try {
    const duplicate = await Declaration.findOne({
      nomEnfant: declarationData.nomEnfant.trim(),
      prenomEnfant: declarationData.prenomEnfant.trim(),
      dateNaissance: declarationData.dateNaissance,
      nomPere: declarationData.nomPere.trim(),
      nomMere: declarationData.nomMere.trim()
    });

    return duplicate;
  } catch (error) {
    console.error('Erreur lors de la vérification des doublons:', error);
    return null;
  }
};

// @desc    Créer une nouvelle déclaration
// @route   POST /api/declarations
// @access  Private (Parent)
exports.createDeclaration = async (req, res) => {
  try {
    // Vérifier que la mairie est fournie
    if (!req.body.mairie) {
      return res.status(400).json({
        success: false,
        message: 'La mairie est requise pour la déclaration'
      });
    }

    // Vérifier que la mairie existe
    const mairie = await Mairie.findById(req.body.mairie);
    if (!mairie) {
      return res.status(404).json({
        success: false,
        message: 'Mairie non trouvée'
      });
    }

    // Vérifier l'hôpital d'accouchement
    // Soit hopitalAccouchement est fourni (ID d'un hôpital dans la base)
    // Soit hopitalAccouchement est null/undefined et hopitalAutre est rempli
    if (!req.body.hopitalAccouchement && (!req.body.hopitalAutre || !req.body.hopitalAutre.nom)) {
      return res.status(400).json({
        success: false,
        message: 'Vous devez sélectionner un hôpital dans la base de données ou fournir les détails d\'un autre hôpital'
      });
    }

    // Si un hôpital est sélectionné dans la base, vérifier qu'il existe
    if (req.body.hopitalAccouchement && req.body.hopitalAccouchement !== 'autre') {
      const hopital = await Hopital.findById(req.body.hopitalAccouchement);
      if (!hopital) {
        return res.status(404).json({
          success: false,
          message: 'Hôpital non trouvé dans la base de données'
        });
      }
      // Si un hôpital de la base est sélectionné, on ne doit pas avoir hopitalAutre
      req.body.hopitalAutre = null;
    } else {
      // Si "autre" est sélectionné, vérifier que hopitalAutre est bien rempli
      if (!req.body.hopitalAutre || !req.body.hopitalAutre.nom || !req.body.hopitalAutre.type) {
        return res.status(400).json({
          success: false,
          message: 'Veuillez fournir tous les détails de l\'hôpital d\'accouchement (nom, type, adresse, etc.)'
        });
      }
      // Pour "autre", on met null pour hopitalAccouchement
      req.body.hopitalAccouchement = null;
    }

    // Vérifier les doublons
    const duplicate = await checkDuplicate(req.body);
    
    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: 'Une déclaration avec les mêmes informations existe déjà',
        duplicateId: duplicate._id
      });
    }

    // Préparer les données de la déclaration
    const declarationData = {
      ...req.body,
      user: req.user.id,
      statut: 'en_cours_mairie', // Statut initial : en cours de traitement par la mairie
      dateEnvoiMairie: new Date()
    };

    // Lier le certificat d'accouchement à l'hôpital si c'est dans la base
    if (declarationData.hopitalAccouchement) {
      declarationData.certificatAccouchement = declarationData.certificatAccouchement || {};
      declarationData.certificatAccouchement.hopitalDelivrant = declarationData.hopitalAccouchement;
    }

    // Créer la déclaration
    const declaration = new Declaration(declarationData);
    await declaration.save();

    // Créer une notification uniquement pour les agents de la mairie sélectionnée
    const agentsMairie = await User.find({ 
      role: 'mairie', 
      isVerified: true,
      mairieAffiliee: mairie._id
    });
    
    // Si aucun agent n'est lié à cette mairie, notifier tous les agents mairie (fallback)
    const agentsToNotify = agentsMairie.length > 0 ? agentsMairie : await User.find({ role: 'mairie', isVerified: true });
    
    for (const agent of agentsToNotify) {
      await createNotification(
        agent._id,
        'declaration_nouvelle',
        'Nouvelle déclaration de naissance',
        `Une nouvelle déclaration de naissance a été soumise pour ${req.body.prenomEnfant} ${req.body.nomEnfant} à la mairie de ${mairie.nom}`,
        declaration._id
      );
    }

    // Notification pour le parent
    await createNotification(
      req.user.id,
      'declaration_nouvelle',
      'Déclaration soumise',
      `Votre déclaration de naissance pour ${req.body.prenomEnfant} ${req.body.nomEnfant} a été soumise avec succès et est en cours de traitement par la mairie`,
      declaration._id
    );

    // Populate les références pour la réponse
    await declaration.populate('region departement commune communauteRurale user mairie hopitalAccouchement hopitalAssigne');

    res.status(201).json({
      success: true,
      message: 'Déclaration créée avec succès',
      declaration
    });
  } catch (error) {
    console.error('Erreur lors de la création de la déclaration:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création de la déclaration',
      error: error.message
    });
  }
};

// @desc    Obtenir toutes les déclarations (selon le rôle)
// @route   GET /api/declarations
// @access  Private
exports.getDeclarations = async (req, res) => {
  try {
    let query = {};
    let sort = { dateDeclaration: -1 };

    // Filtrer selon le rôle
    if (req.user.role === 'parent') {
      query.user = req.user.id;
    } else if (req.user.role === 'mairie') {
      query.statut = { $in: ['en_cours_mairie', 'en_verification_hopital', 'certificat_valide', 'certificat_rejete'] };
    } else if (req.user.role === 'hopital') {
      query.statut = { $in: ['en_verification_hopital'] };
      // Si un hôpital est assigné, filtrer par hôpital assigné
      if (req.query.hopitalAssigne) {
        query.hopitalAssigne = req.query.hopitalAssigne;
      }
    }

    const declarations = await Declaration.find(query)
      .populate('region departement commune communauteRurale user mairie hopitalAccouchement hopitalAssigne')
      .sort(sort);

    res.json({
      success: true,
      count: declarations.length,
      declarations
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des déclarations:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// @desc    Obtenir une déclaration par ID
// @route   GET /api/declarations/:id
// @access  Private
exports.getDeclarationById = async (req, res) => {
  try {
    const declaration = await Declaration.findById(req.params.id)
      .populate('region departement commune communauteRurale user mairie hopitalAccouchement hopitalAssigne');

    if (!declaration) {
      return res.status(404).json({
        success: false,
        message: 'Déclaration non trouvée'
      });
    }

    // Vérifier les permissions
    if (req.user.role === 'parent' && declaration.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé'
      });
    }

    res.json({
      success: true,
      declaration
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la déclaration:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// @desc    Obtenir les hôpitaux suggérés pour une déclaration
// @route   GET /api/declarations/:id/suggested-hospitals
// @access  Private (Mairie)
exports.getSuggestedHospitals = async (req, res) => {
  try {
    const declaration = await Declaration.findById(req.params.id)
      .populate('region departement hopitalAccouchement');

    if (!declaration) {
      return res.status(404).json({
        success: false,
        message: 'Déclaration non trouvée'
      });
    }

    if (req.user.role !== 'mairie') {
      return res.status(403).json({
        success: false,
        message: 'Seuls les agents mairie peuvent effectuer cette action'
      });
    }

    let query = { 
      active: true,
      delivreCertificatAccouchement: true
    };

    // Si l'hôpital d'accouchement est dans la base, le suggérer en premier
    if (declaration.hopitalAccouchement) {
      // Suggérer l'hôpital d'accouchement et les hôpitaux de la même région
      query.region = declaration.region._id || declaration.region;
    } else {
      // Si l'hôpital est "autre", suggérer les hôpitaux de la région de la déclaration
      query.region = declaration.region._id || declaration.region;
    }

    const hopitaux = await Hopital.find(query)
      .populate('region departement')
      .sort({ nom: 1 });

    // Si l'hôpital d'accouchement est dans la base, le mettre en premier
    const hopitauxOrdered = [];
    if (declaration.hopitalAccouchement) {
      const hopitalAccouchement = hopitaux.find(h => h._id.toString() === declaration.hopitalAccouchement.toString());
      if (hopitalAccouchement) {
        hopitauxOrdered.push(hopitalAccouchement);
        hopitauxOrdered.push(...hopitaux.filter(h => h._id.toString() !== declaration.hopitalAccouchement.toString()));
      } else {
        hopitauxOrdered.push(...hopitaux);
      }
    } else {
      hopitauxOrdered.push(...hopitaux);
    }

    res.json({
      success: true,
      count: hopitauxOrdered.length,
      hopitaux: hopitauxOrdered,
      hopitalAccouchement: declaration.hopitalAccouchement,
      hopitalAutre: declaration.hopitalAutre
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des hôpitaux suggérés:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// @desc    Mairie : Accepter et envoyer à l'hôpital
// @route   PUT /api/declarations/:id/send-to-hospital
// @access  Private (Mairie)
exports.sendToHospital = async (req, res) => {
  try {
    // Vérifier que l'ID est un ObjectId valide
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de déclaration invalide'
      });
    }

    const { hopitalAssigne } = req.body;

    if (!hopitalAssigne) {
      return res.status(400).json({
        success: false,
        message: 'L\'hôpital à assigner est requis'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(hopitalAssigne)) {
      return res.status(400).json({
        success: false,
        message: 'ID d\'hôpital invalide'
      });
    }

    // Vérifier que l'hôpital existe
    const hopital = await Hopital.findById(hopitalAssigne);
    if (!hopital) {
      return res.status(404).json({
        success: false,
        message: 'Hôpital non trouvé'
      });
    }

    const declaration = await Declaration.findById(req.params.id);

    if (!declaration) {
      return res.status(404).json({
        success: false,
        message: 'Déclaration non trouvée'
      });
    }

    if (req.user.role !== 'mairie') {
      return res.status(403).json({
        success: false,
        message: 'Seuls les agents mairie peuvent effectuer cette action'
      });
    }

    // Mettre à jour la déclaration
    // Vérifier que la déclaration est bien en cours de traitement par la mairie
    if (declaration.statut !== 'en_cours_mairie' && declaration.statut !== 'certificat_valide' && declaration.statut !== 'certificat_rejete') {
      return res.status(400).json({
        success: false,
        message: 'Cette déclaration ne peut pas être envoyée à l\'hôpital dans son état actuel'
      });
    }

    declaration.statut = 'en_verification_hopital';
    declaration.hopitalAssigne = hopitalAssigne;
    declaration.dateEnvoiHopital = new Date();
    declaration.traiteeParMairie = req.user.id;
    await declaration.save();

    // Notification uniquement pour les agents de l'hôpital assigné
    const agentsHopital = await User.find({ 
      role: 'hopital', 
      isVerified: true,
      hopitalAffilie: hopitalAssigne
    });

    // Si aucun agent n'est lié à cet hôpital, notifier tous les agents hôpital (fallback)
    const agentsToNotify = agentsHopital.length > 0 ? agentsHopital : await User.find({ role: 'hopital', isVerified: true });
    
    for (const agent of agentsToNotify) {
      await createNotification(
        agent._id,
        'en_verification_hopital',
        'Déclaration à vérifier',
        `Une déclaration de naissance nécessite la vérification du certificat d'accouchement pour ${declaration.prenomEnfant} ${declaration.nomEnfant}. Hôpital assigné: ${hopital.nom}`,
        declaration._id
      );
    }

    // Notification pour le parent
    await createNotification(
      declaration.user,
      'declaration_envoyee_hopital',
      'Déclaration envoyée à l\'hôpital',
      `Votre déclaration pour ${declaration.prenomEnfant} ${declaration.nomEnfant} a été envoyée à l'hôpital pour vérification`,
      declaration._id
    );

    await declaration.populate('region departement commune communauteRurale user mairie hopitalAccouchement hopitalAssigne');

    res.json({
      success: true,
      message: 'Déclaration envoyée à l\'hôpital avec succès',
      declaration
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi à l\'hôpital:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// @desc    Mairie : Rejeter une déclaration
// @route   PUT /api/declarations/:id/reject
// @access  Private (Mairie)
exports.rejectDeclaration = async (req, res) => {
  try {
    // Vérifier que l'ID est un ObjectId valide
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de déclaration invalide'
      });
    }

    const { motifRejet } = req.body;

    if (!motifRejet) {
      return res.status(400).json({
        success: false,
        message: 'Le motif de rejet est requis'
      });
    }

    const declaration = await Declaration.findById(req.params.id);

    if (!declaration) {
      return res.status(404).json({
        success: false,
        message: 'Déclaration non trouvée'
      });
    }

    if (req.user.role !== 'mairie') {
      return res.status(403).json({
        success: false,
        message: 'Seuls les agents mairie peuvent effectuer cette action'
      });
    }

    declaration.statut = 'rejetee';
    declaration.motifRejet = motifRejet;
    declaration.dateRejet = new Date();
    declaration.traiteeParMairie = req.user.id;
    await declaration.save();

    // Notification pour le parent
    await createNotification(
      declaration.user,
      'declaration_rejetee',
      'Déclaration rejetée',
      `Votre déclaration pour ${declaration.prenomEnfant} ${declaration.nomEnfant} a été rejetée. Motif: ${motifRejet}`,
      declaration._id
    );

    res.json({
      success: true,
      message: 'Déclaration rejetée',
      declaration
    });
  } catch (error) {
    console.error('Erreur lors du rejet de la déclaration:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// @desc    Hôpital : Valider le certificat
// @route   PUT /api/declarations/:id/validate-certificate
// @access  Private (Hôpital)
exports.validateCertificate = async (req, res) => {
  try {
    const declaration = await Declaration.findById(req.params.id);

    if (!declaration) {
      return res.status(404).json({
        success: false,
        message: 'Déclaration non trouvée'
      });
    }

    if (req.user.role !== 'hopital') {
      return res.status(403).json({
        success: false,
        message: 'Seuls les agents hôpital peuvent effectuer cette action'
      });
    }

    // Vérifier que la déclaration est bien en vérification à l'hôpital
    if (declaration.statut !== 'en_verification_hopital') {
      return res.status(400).json({
        success: false,
        message: 'Cette déclaration n\'est pas en attente de vérification'
      });
    }

    declaration.statut = 'certificat_valide';
    if (!declaration.certificatAccouchement) {
      declaration.certificatAccouchement = {};
    }
    declaration.certificatAccouchement.authentique = true;
    declaration.certificatAccouchement.dateVerification = new Date();
    declaration.certificatAccouchement.verifiePar = req.user.id;
    declaration.traiteeParHopital = req.user.id;
    await declaration.save();

    // Notification pour la mairie
    const agentsMairie = await User.find({ role: 'mairie', isVerified: true });
    for (const agent of agentsMairie) {
      await createNotification(
        agent._id,
        'certificat_valide',
        'Certificat validé',
        `Le certificat d'accouchement pour ${declaration.prenomEnfant} ${declaration.nomEnfant} a été validé`,
        declaration._id
      );
    }

    // Notification pour le parent
    await createNotification(
      declaration.user,
      'certificat_valide',
      'Certificat validé',
      `Le certificat d'accouchement pour ${declaration.prenomEnfant} ${declaration.nomEnfant} a été validé par l'hôpital`,
      declaration._id
    );

    res.json({
      success: true,
      message: 'Certificat validé avec succès',
      declaration
    });
  } catch (error) {
    console.error('Erreur lors de la validation du certificat:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// @desc    Hôpital : Rejeter le certificat
// @route   PUT /api/declarations/:id/reject-certificate
// @access  Private (Hôpital)
exports.rejectCertificate = async (req, res) => {
  try {
    // Vérifier que l'ID est un ObjectId valide
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de déclaration invalide'
      });
    }

    const { motifRejetHopital } = req.body;

    if (!motifRejetHopital) {
      return res.status(400).json({
        success: false,
        message: 'Le motif de rejet est requis'
      });
    }

    const declaration = await Declaration.findById(req.params.id);

    if (!declaration) {
      return res.status(404).json({
        success: false,
        message: 'Déclaration non trouvée'
      });
    }

    if (req.user.role !== 'hopital') {
      return res.status(403).json({
        success: false,
        message: 'Seuls les agents hôpital peuvent effectuer cette action'
      });
    }

    // Vérifier que la déclaration est bien en vérification à l'hôpital
    if (declaration.statut !== 'en_verification_hopital') {
      return res.status(400).json({
        success: false,
        message: 'Cette déclaration n\'est pas en attente de vérification'
      });
    }

    declaration.statut = 'certificat_rejete';
    if (!declaration.certificatAccouchement) {
      declaration.certificatAccouchement = {};
    }
    declaration.certificatAccouchement.authentique = false;
    declaration.certificatAccouchement.dateVerification = new Date();
    declaration.motifRejetHopital = motifRejetHopital;
    declaration.traiteeParHopital = req.user.id;
    await declaration.save();

    // Notification pour la mairie
    const agentsMairie = await User.find({ role: 'mairie', isVerified: true });
    for (const agent of agentsMairie) {
      await createNotification(
        agent._id,
        'certificat_rejete',
        'Certificat rejeté',
        `Le certificat d'accouchement pour ${declaration.prenomEnfant} ${declaration.nomEnfant} a été rejeté. Motif: ${motifRejetHopital}`,
        declaration._id
      );
    }

    // Notification pour le parent
    await createNotification(
      declaration.user,
      'certificat_rejete',
      'Certificat rejeté',
      `Le certificat d'accouchement pour ${declaration.prenomEnfant} ${declaration.nomEnfant} a été rejeté. Motif: ${motifRejetHopital}`,
      declaration._id
    );

    res.json({
      success: true,
      message: 'Certificat rejeté',
      declaration
    });
  } catch (error) {
    console.error('Erreur lors du rejet du certificat:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

