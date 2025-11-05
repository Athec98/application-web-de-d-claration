const ActeNaissance = require('../models/ActeNaissance');
const Declaration = require('../models/Declaration');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Mairie = require('../models/Mairie');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

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

// Générer un numéro de registre unique
const generateNumeroRegistre = async (mairieId, annee) => {
  try {
    const count = await ActeNaissance.countDocuments({
      mairie: mairieId,
      annee: annee
    });
    const numero = String(count + 1).padStart(6, '0');
    return `${mairieId.toString().slice(-4)}-${annee}-${numero}`;
  } catch (error) {
    console.error('Erreur génération numéro registre:', error);
    throw error;
  }
};

// Générer un numéro d'acte unique
const generateNumeroActe = async (mairieId, annee) => {
  try {
    const count = await ActeNaissance.countDocuments({
      mairie: mairieId,
      annee: annee
    });
    const numero = String(count + 1).padStart(6, '0');
    return `ACT-${mairieId.toString().slice(-4)}-${annee}-${numero}`;
  } catch (error) {
    console.error('Erreur génération numéro acte:', error);
    throw error;
  }
};

// Générer un timbre numérique
const generateTimbre = () => {
  return crypto.randomBytes(16).toString('hex').toUpperCase();
};

// Générer un cachet numérique
const generateCachetNumerique = (mairieNom, date) => {
  const hash = crypto.createHash('sha256')
    .update(`${mairieNom}${date.toISOString()}`)
    .digest('hex')
    .substring(0, 32)
    .toUpperCase();
  return hash;
};

// @desc    Générer l'acte de naissance
// @route   POST /api/actes-naissance/generate/:declarationId
// @access  Private (Mairie)
exports.generateActeNaissance = async (req, res) => {
  try {
    const declaration = await Declaration.findById(req.params.declarationId)
      .populate('region departement commune mairie hopitalAccouchement user');

    if (!declaration) {
      return res.status(404).json({
        success: false,
        message: 'Déclaration non trouvée'
      });
    }

    // Vérifier les permissions
    if (req.user.role !== 'mairie') {
      return res.status(403).json({
        success: false,
        message: 'Seuls les agents mairie peuvent générer un acte de naissance'
      });
    }

    // Vérifier que le certificat est validé
    if (declaration.statut !== 'certificat_valide') {
      return res.status(400).json({
        success: false,
        message: 'Le certificat d\'accouchement doit être validé avant de générer l\'acte de naissance'
      });
    }

    // Vérifier si un acte existe déjà
    if (declaration.acteNaissance) {
      const acteExistant = await ActeNaissance.findById(declaration.acteNaissance);
      if (acteExistant) {
        return res.status(400).json({
          success: false,
          message: 'Un acte de naissance existe déjà pour cette déclaration',
          acteNaissance: acteExistant
        });
      }
    }

    const annee = new Date().getFullYear();
    const numeroRegistre = await generateNumeroRegistre(declaration.mairie._id, annee);
    const numeroActe = await generateNumeroActe(declaration.mairie._id, annee);
    const timbre = generateTimbre();
    const cachetNumerique = generateCachetNumerique(declaration.mairie.nom, new Date());

    // Créer l'acte de naissance
    const acteNaissance = new ActeNaissance({
      declaration: declaration._id,
      numeroRegistre,
      annee,
      numeroActe,
      nomEnfant: declaration.nomEnfant,
      prenomEnfant: declaration.prenomEnfant,
      dateNaissance: declaration.dateNaissance,
      heureNaissance: declaration.heureNaissance,
      lieuNaissance: declaration.lieuNaissance,
      sexe: declaration.sexe,
      nomPere: declaration.nomPere,
      prenomPere: declaration.prenomPere,
      professionPere: declaration.professionPere,
      nationalitePere: declaration.nationalitePere,
      nomMere: declaration.nomMere,
      prenomMere: declaration.prenomMere,
      nomJeuneFilleMere: declaration.nomJeuneFilleMere,
      professionMere: declaration.professionMere,
      nationaliteMere: declaration.nationaliteMere,
      region: declaration.region._id,
      departement: declaration.departement._id,
      commune: declaration.commune?._id,
      mairie: declaration.mairie._id,
      timbre,
      cachetNumerique,
      prixUnitaire: 250, // 250 FCFA par acte
      generePar: req.user.id
    });

    // Générer le PDF
    const pdfBuffer = await generatePDF(acteNaissance, declaration);

    // Créer le dossier pour les actes si nécessaire
    const uploadsDir = path.join(__dirname, '../uploads/actes-naissance');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Sauvegarder le PDF
    const fileName = `acte-naissance-${numeroActe}-${Date.now()}.pdf`;
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, pdfBuffer);

    // Mettre à jour l'acte avec le chemin du fichier
    acteNaissance.fichierPDF = {
      nom: fileName,
      url: `/api/actes-naissance/download/${acteNaissance._id}`,
      chemin: filePath,
      taille: pdfBuffer.length,
      dateGeneration: new Date()
    };

    await acteNaissance.save();

    // Mettre à jour la déclaration
    declaration.acteNaissance = acteNaissance._id;
    declaration.statut = 'validee';
    declaration.dateValidation = new Date();
    await declaration.save();

    // Notification pour le parent
    await createNotification(
      declaration.user._id || declaration.user,
      'acte_genere',
      'Acte de naissance généré',
      `Votre acte de naissance pour ${declaration.prenomEnfant} ${declaration.nomEnfant} a été généré avec succès. Numéro d'acte: ${numeroActe}`,
      declaration._id
    );

    await acteNaissance.populate('region departement commune mairie declaration');

    res.status(201).json({
      success: true,
      message: 'Acte de naissance généré avec succès',
      acteNaissance
    });
  } catch (error) {
    console.error('Erreur lors de la génération de l\'acte de naissance:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la génération de l\'acte de naissance',
      error: error.message
    });
  }
};

// Fonction pour générer le PDF
async function generatePDF(acteNaissance, declaration) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      // En-tête
      doc.fontSize(16).font('Helvetica-Bold')
        .text('RÉPUBLIQUE DU SÉNÉGAL', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(12).font('Helvetica')
        .text('MINISTÈRE DE L\'INTÉRIEUR', { align: 'center' });
      doc.moveDown(0.5);
      doc.text(`MAIRIE DE ${declaration.mairie.nom.toUpperCase()}`, { align: 'center' });
      doc.moveDown(1);

      // Titre
      doc.fontSize(14).font('Helvetica-Bold')
        .text('ACTE DE NAISSANCE', { align: 'center' });
      doc.moveDown(1);

      // Numéro d'acte et numéro de registre
      doc.fontSize(10).font('Helvetica')
        .text(`Numéro d'acte: ${acteNaissance.numeroActe}`, { align: 'left' });
      doc.text(`Numéro de registre: ${acteNaissance.numeroRegistre}`, { align: 'left' });
      doc.text(`Année: ${acteNaissance.annee}`, { align: 'left' });
      doc.moveDown(1);

      // Contenu de l'acte
      doc.fontSize(11).font('Helvetica')
        .text(`Le ${new Date(acteNaissance.dateNaissance).toLocaleDateString('fr-FR', { 
          day: '2-digit', 
          month: 'long', 
          year: 'numeric' 
        })} à ${acteNaissance.heureNaissance || '--:--'} heures, est né${acteNaissance.sexe === 'F' ? 'e' : ''} à ${acteNaissance.lieuNaissance}:`, { align: 'justify' });
      doc.moveDown(0.5);

      // Nom de l'enfant
      doc.fontSize(12).font('Helvetica-Bold')
        .text(`${acteNaissance.prenomEnfant} ${acteNaissance.nomEnfant}`, { align: 'center' });
      doc.moveDown(1);

      // Informations sur l'enfant
      doc.fontSize(11).font('Helvetica')
        .text(`Sexe: ${acteNaissance.sexe === 'M' ? 'Masculin' : 'Féminin'}`, { align: 'left' });
      doc.moveDown(0.5);

      // Informations sur les parents
      doc.text('Né de:', { align: 'left' });
      doc.moveDown(0.3);
      if (acteNaissance.prenomPere || acteNaissance.nomPere) {
        doc.text(`Père: ${acteNaissance.prenomPere || ''} ${acteNaissance.nomPere || ''}`, { align: 'left' });
        if (acteNaissance.professionPere) {
          doc.text(`Profession: ${acteNaissance.professionPere}`, { align: 'left', indent: 20 });
        }
        if (acteNaissance.nationalitePere) {
          doc.text(`Nationalité: ${acteNaissance.nationalitePere}`, { align: 'left', indent: 20 });
        }
        doc.moveDown(0.5);
      }

      if (acteNaissance.prenomMere || acteNaissance.nomMere) {
        doc.text(`Mère: ${acteNaissance.prenomMere || ''} ${acteNaissance.nomMere || ''}`, { align: 'left' });
        if (acteNaissance.nomJeuneFilleMere) {
          doc.text(`Née: ${acteNaissance.nomJeuneFilleMere}`, { align: 'left', indent: 20 });
        }
        if (acteNaissance.professionMere) {
          doc.text(`Profession: ${acteNaissance.professionMere}`, { align: 'left', indent: 20 });
        }
        if (acteNaissance.nationaliteMere) {
          doc.text(`Nationalité: ${acteNaissance.nationaliteMere}`, { align: 'left', indent: 20 });
        }
        doc.moveDown(0.5);
      }

      // Timbre et cachet
      doc.moveDown(1);
      doc.fontSize(9).font('Helvetica')
        .text(`Timbre: ${acteNaissance.timbre}`, { align: 'left' });
      doc.text(`Cachet numérique: ${acteNaissance.cachetNumerique}`, { align: 'left' });
      doc.moveDown(1);

      // Date de délivrance
      doc.text(`Délivré le ${new Date().toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric' 
      })}`, { align: 'right' });
      doc.moveDown(1);

      // Signature
      doc.moveDown(2);
      doc.text('Le Maire', { align: 'right' });
      doc.text(`_________________________`, { align: 'right' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

// @desc    Obtenir un acte de naissance
// @route   GET /api/actes-naissance/:id
// @access  Private
exports.getActeNaissance = async (req, res) => {
  try {
    const acteNaissance = await ActeNaissance.findById(req.params.id)
      .populate('declaration region departement commune mairie');

    if (!acteNaissance) {
      return res.status(404).json({
        success: false,
        message: 'Acte de naissance non trouvé'
      });
    }

    // Vérifier les permissions
    const declaration = await Declaration.findById(acteNaissance.declaration);
    if (req.user.role === 'parent' && declaration.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé'
      });
    }

    res.json({
      success: true,
      acteNaissance
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'acte de naissance:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// @desc    Initier le paiement et téléchargement
// @route   POST /api/actes-naissance/:id/payment
// @access  Private (Parent)
exports.initiatePayment = async (req, res) => {
  try {
    const { nombreActes, modePaiement } = req.body;

    if (!nombreActes || nombreActes < 1) {
      return res.status(400).json({
        success: false,
        message: 'Le nombre d\'actes doit être supérieur à 0'
      });
    }

    const acteNaissance = await ActeNaissance.findById(req.params.id)
      .populate('declaration');

    if (!acteNaissance) {
      return res.status(404).json({
        success: false,
        message: 'Acte de naissance non trouvé'
      });
    }

    // Vérifier que c'est le parent qui fait la demande
    const declaration = await Declaration.findById(acteNaissance.declaration);
    if (req.user.role !== 'parent' || declaration.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Seul le parent peut télécharger l\'acte de naissance'
      });
    }

    const montant = nombreActes * acteNaissance.prixUnitaire;

    // Créer l'entrée de téléchargement
    const telechargement = {
      dateTelechargement: new Date(),
      nombreActes,
      montant,
      modePaiement: modePaiement || 'autre',
      statutPaiement: 'en_attente'
    };

    acteNaissance.telechargements.push(telechargement);
    await acteNaissance.save();

    // Générer une référence de paiement unique
    const referencePaiement = `PAY-${acteNaissance.numeroActe}-${Date.now()}`;
    
    // Mettre à jour la référence
    const lastTelechargement = acteNaissance.telechargements[acteNaissance.telechargements.length - 1];
    lastTelechargement.referencePaiement = referencePaiement;
    await acteNaissance.save();

    // Ici, vous intégreriez avec Wave, Orange Money, etc.
    // Pour l'instant, on simule juste la réponse
    res.json({
      success: true,
      message: 'Paiement initié',
      telechargement: {
        id: lastTelechargement._id,
        nombreActes,
        montant,
        prixUnitaire: acteNaissance.prixUnitaire,
        modePaiement,
        referencePaiement,
        statutPaiement: 'en_attente',
        // URL de paiement (à intégrer avec les services de paiement réels)
        paymentUrl: `/api/actes-naissance/payment/confirm/${referencePaiement}`
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'initiation du paiement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// @desc    Confirmer le paiement et télécharger
// @route   POST /api/actes-naissance/payment/confirm/:reference
// @access  Private (Parent)
exports.confirmPaymentAndDownload = async (req, res) => {
  try {
    const { reference } = req.params;

    // Trouver l'acte avec cette référence
    const acteNaissance = await ActeNaissance.findOne({
      'telechargements.referencePaiement': reference
    }).populate('declaration');

    if (!acteNaissance) {
      return res.status(404).json({
        success: false,
        message: 'Référence de paiement non trouvée'
      });
    }

    const telechargement = acteNaissance.telechargements.find(
      t => t.referencePaiement === reference
    );

    if (!telechargement) {
      return res.status(404).json({
        success: false,
        message: 'Téléchargement non trouvé'
      });
    }

    // Vérifier que c'est le parent
    const declaration = await Declaration.findById(acteNaissance.declaration);
    if (req.user.role !== 'parent' || declaration.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé'
      });
    }

    // Ici, vous vérifieriez le paiement avec Wave/Orange Money
    // Pour l'instant, on simule la confirmation
    telechargement.statutPaiement = 'paye';
    
    // Mettre à jour les statistiques
    acteNaissance.nombreTotalTelechargements += telechargement.nombreActes;
    acteNaissance.montantTotalCollecte += telechargement.montant;

    // Générer le fichier PDF à télécharger (copie avec nombre d'exemplaires)
    const filePath = path.join(__dirname, '../uploads/actes-naissance', acteNaissance.fichierPDF.nom);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Fichier PDF non trouvé'
      });
    }

    // Mettre à jour le téléchargement avec le fichier
    telechargement.fichierTelecharge = {
      nom: acteNaissance.fichierPDF.nom,
      url: `/api/actes-naissance/download/${acteNaissance._id}?ref=${reference}`
    };

    await acteNaissance.save();

    // Envoyer le fichier
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="acte-naissance-${acteNaissance.numeroActe}.pdf"`);
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Erreur lors de la confirmation du paiement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// @desc    Télécharger l'acte de naissance (après paiement)
// @route   GET /api/actes-naissance/download/:id
// @access  Private (Parent)
exports.downloadActeNaissance = async (req, res) => {
  try {
    const acteNaissance = await ActeNaissance.findById(req.params.id)
      .populate('declaration');

    if (!acteNaissance) {
      return res.status(404).json({
        success: false,
        message: 'Acte de naissance non trouvé'
      });
    }

    // Vérifier que c'est le parent
    const declaration = await Declaration.findById(acteNaissance.declaration);
    if (req.user.role !== 'parent' || declaration.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé'
      });
    }

    // Vérifier si une référence de paiement est fournie
    const { ref } = req.query;
    if (ref) {
      const telechargement = acteNaissance.telechargements.find(
        t => t.referencePaiement === ref && t.statutPaiement === 'paye'
      );
      
      if (!telechargement) {
        return res.status(403).json({
          success: false,
          message: 'Paiement non confirmé ou référence invalide'
        });
      }
    }

    const filePath = path.join(__dirname, '../uploads/actes-naissance', acteNaissance.fichierPDF.nom);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Fichier PDF non trouvé'
      });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="acte-naissance-${acteNaissance.numeroActe}.pdf"`);
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Erreur lors du téléchargement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

