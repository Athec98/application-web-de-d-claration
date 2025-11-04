const BirthDeclaration = require('../models/BirthDeclaration');
const path = require('path');
const fs = require('fs').promises;

// @desc    Créer une nouvelle déclaration
// @route   POST /api/declarations
// @access  Private (Parent)
exports.createDeclaration = async (req, res, next) => {
  try {
    const declarationData = {
      ...req.body,
      parentId: req.user.id
    };

    // Gérer les fichiers uploadés
    if (req.files && req.files.length > 0) {
      declarationData.documents = req.files.map(file => ({
        type: file.fieldname,
        filename: file.filename,
        path: file.path
      }));
    }

    const declaration = await BirthDeclaration.create(declarationData);

    res.status(201).json({
      success: true,
      message: 'Déclaration créée avec succès',
      data: declaration
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir toutes les déclarations d'un parent
// @route   GET /api/declarations/my-declarations
// @access  Private (Parent)
exports.getMyDeclarations = async (req, res, next) => {
  try {
    const declarations = await BirthDeclaration.find({ parentId: req.user.id })
      .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      count: declarations.length,
      data: declarations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir une déclaration par ID
// @route   GET /api/declarations/:id
// @access  Private
exports.getDeclarationById = async (req, res, next) => {
  try {
    const declaration = await BirthDeclaration.findById(req.params.id)
      .populate('parentId', 'firstName lastName phoneNumber email');

    if (!declaration) {
      return res.status(404).json({
        success: false,
        message: 'Déclaration non trouvée'
      });
    }

    // Vérifier les permissions
    if (req.user.role === 'parent' && declaration.parentId._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé'
      });
    }

    res.status(200).json({
      success: true,
      data: declaration
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mettre à jour une déclaration (Parent uniquement si status = en_cours)
// @route   PUT /api/declarations/:id
// @access  Private (Parent)
exports.updateDeclaration = async (req, res, next) => {
  try {
    const declaration = await BirthDeclaration.findById(req.params.id);

    if (!declaration) {
      return res.status(404).json({
        success: false,
        message: 'Déclaration non trouvée'
      });
    }

    // Vérifier que c'est bien le parent propriétaire
    if (declaration.parentId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé'
      });
    }

    // Vérifier que le statut permet la modification
    if (declaration.status !== 'en_cours') {
      return res.status(400).json({
        success: false,
        message: 'Cette déclaration ne peut plus être modifiée'
      });
    }

    // Mettre à jour les champs
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        declaration[key] = req.body[key];
      }
    });

    // Gérer les nouveaux fichiers
    if (req.files && req.files.length > 0) {
      const newDocuments = req.files.map(file => ({
        type: file.fieldname,
        filename: file.filename,
        path: file.path
      }));
      declaration.documents.push(...newDocuments);
    }

    await declaration.save();

    res.status(200).json({
      success: true,
      message: 'Déclaration mise à jour avec succès',
      data: declaration
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir toutes les déclarations (Mairie)
// @route   GET /api/declarations/mairie/all
// @access  Private (Mairie)
exports.getAllDeclarationsForMairie = async (req, res, next) => {
  try {
    const declarations = await BirthDeclaration.find()
      .populate('parentId', 'firstName lastName phoneNumber email')
      .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      count: declarations.length,
      data: declarations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Envoyer une déclaration à l'hôpital pour vérification
// @route   PUT /api/declarations/:id/send-to-hospital
// @access  Private (Mairie)
exports.sendToHospital = async (req, res, next) => {
  try {
    const declaration = await BirthDeclaration.findById(req.params.id);

    if (!declaration) {
      return res.status(404).json({
        success: false,
        message: 'Déclaration non trouvée'
      });
    }

    declaration.hospitalVerification = {
      status: 'pending'
    };
    declaration.status = 'en_attente';

    await declaration.save();

    // TODO: Envoyer notification à l'hôpital

    res.status(200).json({
      success: true,
      message: 'Demande de vérification envoyée à l\'hôpital',
      data: declaration
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Rejeter une déclaration (Mairie)
// @route   PUT /api/declarations/:id/reject
// @access  Private (Mairie)
exports.rejectDeclaration = async (req, res, next) => {
  try {
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Le motif de rejet est requis'
      });
    }

    const declaration = await BirthDeclaration.findById(req.params.id);

    if (!declaration) {
      return res.status(404).json({
        success: false,
        message: 'Déclaration non trouvée'
      });
    }

    declaration.status = 'rejete';
    declaration.rejectionReason = rejectionReason;

    await declaration.save();

    // TODO: Envoyer notification au parent

    res.status(200).json({
      success: true,
      message: 'Déclaration rejetée',
      data: declaration
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir les demandes de vérification (Hôpital)
// @route   GET /api/declarations/hopital/verifications
// @access  Private (Hôpital)
exports.getVerificationRequests = async (req, res, next) => {
  try {
    const declarations = await BirthDeclaration.find({
      'hospitalVerification.status': 'pending'
    })
      .populate('parentId', 'firstName lastName phoneNumber email')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: declarations.length,
      data: declarations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Valider le certificat d'accouchement (Hôpital)
// @route   PUT /api/declarations/:id/verify
// @access  Private (Hôpital)
exports.verifyCertificate = async (req, res, next) => {
  try {
    const { isValid, comment } = req.body;

    const declaration = await BirthDeclaration.findById(req.params.id);

    if (!declaration) {
      return res.status(404).json({
        success: false,
        message: 'Déclaration non trouvée'
      });
    }

    if (isValid) {
      declaration.hospitalVerification = {
        status: 'approved',
        verifiedBy: req.user.id,
        verifiedAt: new Date(),
        comment
      };
      // La mairie peut maintenant générer l'acte
    } else {
      declaration.hospitalVerification = {
        status: 'rejected',
        verifiedBy: req.user.id,
        verifiedAt: new Date(),
        comment
      };
      declaration.status = 'rejete';
      declaration.rejectionReason = `Certificat d'accouchement non conforme: ${comment}`;
    }

    await declaration.save();

    // TODO: Envoyer notification à la mairie et au parent

    res.status(200).json({
      success: true,
      message: isValid ? 'Certificat validé' : 'Certificat rejeté',
      data: declaration
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Générer l'acte de naissance (Mairie)
// @route   PUT /api/declarations/:id/generate-certificate
// @access  Private (Mairie)
exports.generateBirthCertificate = async (req, res, next) => {
  try {
    const { digitalStamp, digitalSignature } = req.body;

    const declaration = await BirthDeclaration.findById(req.params.id);

    if (!declaration) {
      return res.status(404).json({
        success: false,
        message: 'Déclaration non trouvée'
      });
    }

    if (declaration.hospitalVerification.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Le certificat d\'accouchement doit être validé par l\'hôpital'
      });
    }

    // Générer un numéro de certificat unique
    const certificateNumber = `SN-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    declaration.birthCertificate = {
      certificateNumber,
      generatedAt: new Date(),
      generatedBy: req.user.id,
      digitalStamp,
      digitalSignature
    };
    declaration.status = 'valide';

    await declaration.save();

    // TODO: Générer le PDF de l'acte de naissance
    // TODO: Envoyer notification au parent

    res.status(200).json({
      success: true,
      message: 'Acte de naissance généré avec succès',
      data: declaration
    });
  } catch (error) {
    next(error);
  }
};
