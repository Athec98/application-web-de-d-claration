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

    // Vérifier que le certificat est validé OU que la déclaration est validée
    // Le statut peut être 'certificat_valide' (après validation hôpital) ou 'validee' (après validation mairie)
    if (declaration.statut !== 'certificat_valide' && declaration.statut !== 'validee') {
      return res.status(400).json({
        success: false,
        message: 'Le certificat d\'accouchement doit être validé par l\'hôpital OU la déclaration doit être validée par la mairie avant de générer l\'acte de naissance'
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
    // Le statut reste "certificat_valide" après génération de l'acte
    // La mairie devra archiver le dossier manuellement pour permettre le téléchargement
    declaration.acteNaissance = acteNaissance._id;
    declaration.statut = 'certificat_valide'; // Ne pas passer directement à "validee"
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

// Fonction pour convertir un nombre en lettres (français)
function nombreEnLettres(num) {
  const unites = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix',
    'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
  const dizaines = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];
  
  if (num === 0) return 'zéro';
  if (num < 20) return unites[num];
  if (num < 100) {
    const dizaine = Math.floor(num / 10);
    const unite = num % 10;
    if (dizaine === 7 || dizaine === 9) {
      return dizaines[dizaine] + '-' + unites[10 + (num % 10)];
    }
    if (unite === 0) return dizaines[dizaine];
    if (unite === 1 && dizaine !== 8) return dizaines[dizaine] + '-et-' + unites[unite];
    return dizaines[dizaine] + '-' + unites[unite];
  }
  if (num < 1000) {
    const centaine = Math.floor(num / 100);
    const reste = num % 100;
    if (centaine === 1) {
      return reste === 0 ? 'cent' : 'cent-' + nombreEnLettres(reste);
    }
    return reste === 0 ? unites[centaine] + '-cents' : unites[centaine] + '-cent-' + nombreEnLettres(reste);
  }
  return num.toString(); // Pour les nombres plus grands, retourner le nombre
}

// Fonction pour générer un timbre visuel (cercle avec texte)
function drawTimbre(doc, x, y, size = 60) {
  const centerX = x + size / 2;
  const centerY = y + size / 2;
  
  // Cercle extérieur
  doc.circle(centerX, centerY, size / 2)
    .lineWidth(2)
    .strokeColor('#000000');
  
  // Cercle intérieur
  doc.circle(centerX, centerY, size / 2 - 5)
    .lineWidth(1)
    .strokeColor('#000000');
  
  // Texte au centre
  doc.fontSize(8)
    .font('Helvetica-Bold')
    .text('TIMBRE', centerX - 15, centerY - 5, { width: 30, align: 'center' });
}

// Fonction pour générer un cachet (cercle avec texte autour)
function drawCachet(doc, x, y, texte, size = 80) {
  const centerX = x + size / 2;
  const centerY = y + size / 2;
  
  // Cercle extérieur épais
  doc.circle(centerX, centerY, size / 2)
    .lineWidth(3)
    .strokeColor('#FF0000');
  
  // Cercle intérieur
  doc.circle(centerX, centerY, size / 2 - 8)
    .lineWidth(1)
    .strokeColor('#FF0000');
  
  // Texte au centre (simplifié)
  doc.fontSize(10)
    .font('Helvetica-Bold')
    .fillColor('#FF0000')
    .text(texte.substring(0, 15), centerX - 30, centerY - 5, { width: 60, align: 'center' });
  
  doc.fillColor('#000000'); // Remettre la couleur par défaut
}

// Fonction pour générer le PDF avec le design officiel sénégalais
async function generatePDF(acteNaissance, declaration) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 40, bottom: 40, left: 40, right: 40 }
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const margin = 40;
      const contentWidth = pageWidth - (margin * 2);

      // Dessiner les lignes de grille (simulation du formulaire)
      const drawGridLines = () => {
        doc.strokeColor('#CCCCCC').lineWidth(0.5);
        // Lignes horizontales
        for (let y = margin; y < pageHeight - margin; y += 20) {
          doc.moveTo(margin, y).lineTo(pageWidth - margin, y).stroke();
        }
        // Lignes verticales
        for (let x = margin; x < pageWidth - margin; x += 20) {
          doc.moveTo(x, margin).lineTo(x, pageHeight - margin).stroke();
        }
        doc.strokeColor('#000000').lineWidth(1);
      };

      // Lignes de bordure principales
      doc.rect(margin, margin, contentWidth, pageHeight - (margin * 2))
        .lineWidth(1.5)
        .stroke();

      let currentY = margin + 10;

      // ===== EN-TÊTE =====
      // Section droite - République du Sénégal
      doc.fontSize(14).font('Helvetica-Bold')
        .text('RÉPUBLIQUE DU SÉNÉGAL', pageWidth / 2 - 50, currentY, { width: 100, align: 'center' });
      currentY += 15;
      
      doc.fontSize(10).font('Helvetica')
        .text('UN PEUPLE - UN BUT - UNE FOI', pageWidth / 2 - 60, currentY, { width: 120, align: 'center' });
      currentY += 12;
      
      doc.fontSize(12).font('Helvetica-Bold')
        .text('ETAT CIVIL', pageWidth / 2 - 40, currentY, { width: 80, align: 'center' });
      currentY += 12;
      
      doc.fontSize(9).font('Helvetica')
        .text('CENTRE DE (1)', pageWidth / 2 - 30, currentY, { width: 60, align: 'center' });
      currentY += 25;

      // Section gauche - Informations géographiques
      const leftX = margin + 10;
      const rightX = pageWidth / 2 + 20;
      
      doc.fontSize(9).font('Helvetica-Bold')
        .text('RÉGION:', leftX, margin + 10);
      doc.moveTo(leftX + 50, margin + 15).lineTo(leftX + 250, margin + 15).stroke();
      if (declaration.region && declaration.region.nom) {
        doc.fontSize(9).font('Helvetica')
          .text(declaration.region.nom.toUpperCase(), leftX + 52, margin + 10);
      }
      
      doc.fontSize(9).font('Helvetica-Bold')
        .text('DÉPARTEMENT:', leftX, margin + 25);
      doc.moveTo(leftX + 70, margin + 30).lineTo(leftX + 250, margin + 30).stroke();
      if (declaration.departement && declaration.departement.nom) {
        doc.fontSize(9).font('Helvetica')
          .text(declaration.departement.nom.toUpperCase(), leftX + 72, margin + 25);
      }
      
      doc.fontSize(9).font('Helvetica-Bold')
        .text('ARRONDISSEMENT:', leftX, margin + 40);
      doc.moveTo(leftX + 90, margin + 45).lineTo(leftX + 250, margin + 45).stroke();
      
      doc.fontSize(9).font('Helvetica-Bold')
        .text('COLLECTIVITÉ LOCALE', leftX, margin + 55);
      doc.fontSize(7).font('Helvetica')
        .text('(Commune ou Communauté Rurale)', leftX, margin + 62);
      doc.moveTo(leftX, margin + 68).lineTo(leftX + 250, margin + 68).stroke();
      if (declaration.commune && declaration.commune.nom) {
        doc.fontSize(9).font('Helvetica')
          .text(declaration.commune.nom.toUpperCase(), leftX + 2, margin + 55);
      } else if (declaration.mairie && declaration.mairie.nom) {
        doc.fontSize(9).font('Helvetica')
          .text(declaration.mairie.nom.toUpperCase(), leftX + 2, margin + 55);
      }

      currentY = margin + 80;

      // ===== TITRE PRINCIPAL =====
      doc.fontSize(12).font('Helvetica-Bold')
        .text('EXTRAIT du REGISTRE DES ACTES de NAISSANCE', margin + 10, currentY, { 
          width: contentWidth - 20, 
          align: 'center' 
        });
      currentY += 25;

      // ===== INFORMATIONS D'ENREGISTREMENT =====
      const yearText = nombreEnLettres(acteNaissance.annee);
      const numeroRegistreText = nombreEnLettres(parseInt(acteNaissance.numeroRegistre.split('-').pop()) || 1);
      
      doc.fontSize(9).font('Helvetica')
        .text('Pour l\'année (2)', leftX, currentY);
      doc.moveTo(leftX + 80, currentY + 5).lineTo(leftX + 200, currentY + 5).stroke();
      doc.fontSize(9).font('Helvetica')
        .text(yearText, leftX + 82, currentY);
      doc.fontSize(7).font('Helvetica')
        .text('(en lettres)', leftX + 82, currentY + 8);
      
      doc.fontSize(9).font('Helvetica')
        .text('N° dans le Registre', leftX, currentY + 20);
      doc.moveTo(leftX + 85, currentY + 25).lineTo(leftX + 200, currentY + 25).stroke();
      doc.fontSize(9).font('Helvetica')
        .text(numeroRegistreText, leftX + 87, currentY + 20);
      doc.fontSize(7).font('Helvetica')
        .text('(en lettres)', leftX + 87, currentY + 28);

      // Section droite - Numéro en chiffres
      doc.fontSize(9).font('Helvetica')
        .text('AN-', rightX, currentY);
      doc.moveTo(rightX + 25, currentY + 5).lineTo(rightX + 100, currentY + 5).stroke();
      doc.fontSize(9).font('Helvetica')
        .text(acteNaissance.annee.toString(), rightX + 27, currentY);
      
      doc.fontSize(9).font('Helvetica')
        .text('N° dans le Registre en chiffres', rightX, currentY + 20);
      doc.moveTo(rightX, currentY + 25).lineTo(rightX + 100, currentY + 25).stroke();
      const numeroChiffres = acteNaissance.numeroRegistre.split('-').pop() || '000001';
      doc.fontSize(9).font('Helvetica')
        .text(numeroChiffres, rightX + 2, currentY + 20);

      currentY += 50;

      // ===== CONTENU DE L'ACTE =====
      const dateNaissance = new Date(acteNaissance.dateNaissance);
      const jour = dateNaissance.getDate();
      const mois = dateNaissance.toLocaleDateString('fr-FR', { month: 'long' });
      const annee = dateNaissance.getFullYear();
      const heure = acteNaissance.heureNaissance || '--:--';
      
      doc.fontSize(10).font('Helvetica')
        .text(`Le ${jour} ${mois} ${annee} à ${heure} heures, est né${acteNaissance.sexe === 'F' ? 'e' : ''} à ${acteNaissance.lieuNaissance}:`, 
          margin + 10, currentY, { width: contentWidth - 20, align: 'justify' });
      currentY += 20;

      // Prénoms et nom de l'enfant
      doc.fontSize(9).font('Helvetica')
        .text('PRENOMS', leftX, currentY);
      doc.moveTo(leftX + 50, currentY + 5).lineTo(leftX + 200, currentY + 5).stroke();
      doc.fontSize(10).font('Helvetica-Bold')
        .text(acteNaissance.prenomEnfant.toUpperCase(), leftX + 52, currentY);
      
      doc.fontSize(9).font('Helvetica')
        .text('NOM DE FAMILLE', rightX, currentY);
      doc.moveTo(rightX + 80, currentY + 5).lineTo(rightX + 200, currentY + 5).stroke();
      doc.fontSize(10).font('Helvetica-Bold')
        .text(acteNaissance.nomEnfant.toUpperCase(), rightX + 82, currentY);
      currentY += 25;

      // Sexe
      doc.fontSize(9).font('Helvetica')
        .text('un enfant de sexe', leftX, currentY);
      doc.fontSize(9).font('Helvetica-Bold')
        .text('M', leftX + 80, currentY);
      doc.rect(leftX + 95, currentY - 2, 10, 10).stroke();
      if (acteNaissance.sexe === 'M') {
        doc.fontSize(8).text('X', leftX + 97, currentY);
      }
      doc.fontSize(9).font('Helvetica-Bold')
        .text('F', leftX + 115, currentY);
      doc.rect(leftX + 130, currentY - 2, 10, 10).stroke();
      if (acteNaissance.sexe === 'F') {
        doc.fontSize(8).text('X', leftX + 132, currentY);
      }
      doc.fontSize(7).font('Helvetica')
        .text('(4)', leftX + 145, currentY);
      currentY += 20;

      // Lieu de naissance
      doc.fontSize(9).font('Helvetica')
        .text('Lieu de naissance', leftX, currentY);
      doc.moveTo(leftX + 90, currentY + 5).lineTo(leftX + 400, currentY + 5).stroke();
      doc.fontSize(9).font('Helvetica')
        .text(acteNaissance.lieuNaissance.toUpperCase(), leftX + 92, currentY);
      currentY += 20;

      // Pays de naissance (pour les naissances à l'étranger)
      doc.fontSize(8).font('Helvetica')
        .text('Pays de naissance pour les naissances à l\'étranger (3)', leftX, currentY);
      doc.moveTo(leftX, currentY + 5).lineTo(leftX + 200, currentY + 5).stroke();
      doc.fontSize(7).font('Helvetica')
        .text('(écrite en majuscules le lieu de naissance, les prénoms et le nom)', leftX, currentY + 8);
      currentY += 25;

      // ===== INFORMATIONS DES PARENTS =====
      doc.fontSize(9).font('Helvetica')
        .text('Né de:', leftX, currentY);
      currentY += 15;

      // Père
      if (acteNaissance.prenomPere || acteNaissance.nomPere) {
        doc.fontSize(9).font('Helvetica')
          .text('PRENOMS DU PERE', leftX, currentY);
        doc.moveTo(leftX + 85, currentY + 5).lineTo(leftX + 250, currentY + 5).stroke();
        doc.fontSize(9).font('Helvetica')
          .text((acteNaissance.prenomPere || '').toUpperCase(), leftX + 87, currentY);
        
        doc.fontSize(9).font('Helvetica')
          .text('NOM DE FAMILLE', rightX, currentY);
        doc.moveTo(rightX + 80, currentY + 5).lineTo(rightX + 200, currentY + 5).stroke();
        doc.fontSize(9).font('Helvetica')
          .text((acteNaissance.nomPere || '').toUpperCase(), rightX + 82, currentY);
        currentY += 15;
      }

      // Mère
      if (acteNaissance.prenomMere || acteNaissance.nomMere) {
        doc.fontSize(9).font('Helvetica')
          .text('PRENOMS DE LA MERE', leftX, currentY);
        doc.moveTo(leftX + 95, currentY + 5).lineTo(leftX + 250, currentY + 5).stroke();
        doc.fontSize(9).font('Helvetica')
          .text((acteNaissance.prenomMere || '').toUpperCase(), leftX + 97, currentY);
        
        doc.fontSize(9).font('Helvetica')
          .text('NOM DE FAMILLE DE LA MERE', rightX, currentY);
        doc.moveTo(rightX + 130, currentY + 5).lineTo(rightX + 200, currentY + 5).stroke();
        doc.fontSize(9).font('Helvetica')
          .text((acteNaissance.nomMere || '').toUpperCase(), rightX + 132, currentY);
        currentY += 25;
      }

      // ===== JUGEMENT D'AUTORISATION (section gauche) =====
      const jugementY = currentY;
      doc.fontSize(8).font('Helvetica-Bold')
        .text('JUGEMENT D\'AUTORISATION D\'INSCRIPTION', leftX, jugementY);
      doc.fontSize(8).font('Helvetica')
        .text('(EX JUGEMENT SUPPLETIF)', leftX, jugementY + 8);
      
      doc.fontSize(8).font('Helvetica')
        .text('Délivré par le juge de Paix de', leftX, jugementY + 20);
      doc.moveTo(leftX, jugementY + 25).lineTo(leftX + 200, jugementY + 25).stroke();
      
      doc.fontSize(8).font('Helvetica')
        .text('le', leftX, jugementY + 30);
      doc.moveTo(leftX + 20, jugementY + 35).lineTo(leftX + 200, jugementY + 35).stroke();
      currentY = jugementY + 60;

      // ===== TIMBRE ET CACHET =====
      // Zone pour le timbre (en bas à gauche)
      const timbreY = pageHeight - margin - 120;
      const timbreX = margin + 20;
      
      // Dessiner le timbre (cercle avec texte)
      drawTimbre(doc, timbreX, timbreY, 60);
      
      // Texte du timbre numérique en dessous
      doc.fontSize(7).font('Helvetica')
        .text(`Timbre: ${acteNaissance.timbre}`, timbreX, timbreY + 65, { width: 60, align: 'center' });

      // Zone pour le cachet (en bas au centre)
      const cachetX = pageWidth / 2 - 40;
      const cachetY = pageHeight - margin - 120;
      
      // Dessiner le cachet (cercle rouge)
      const cachetText = declaration.mairie?.nom?.substring(0, 10) || 'MAIRIE';
      drawCachet(doc, cachetX, cachetY, cachetText, 80);
      
      // Texte du cachet numérique en dessous
      doc.fontSize(7).font('Helvetica')
        .fillColor('#000000')
        .text(`Cachet: ${acteNaissance.cachetNumerique}`, cachetX, cachetY + 85, { width: 80, align: 'center' });

      // ===== SIGNATURE ET DATE =====
      // Date de délivrance (en haut à droite)
      const dateDelivrance = new Date();
      doc.fontSize(9).font('Helvetica')
        .text(`Délivré le ${dateDelivrance.toLocaleDateString('fr-FR', { 
          day: '2-digit', 
          month: 'long', 
          year: 'numeric' 
        })}`, pageWidth - margin - 150, margin + 10, { width: 150, align: 'right' });

      // Signature (en bas à droite)
      const signatureY = pageHeight - margin - 60;
      const signatureX = pageWidth - margin - 150;
      
      // Ligne de signature
      doc.moveTo(signatureX, signatureY).lineTo(signatureX + 120, signatureY).stroke();
      
      doc.fontSize(9).font('Helvetica-Bold')
        .text('Le Maire', signatureX, signatureY - 15, { width: 120, align: 'center' });
      
      // Zone pour la signature (rectangle)
      doc.rect(signatureX + 130, signatureY - 30, 60, 30)
        .lineWidth(1)
        .stroke();
      doc.fontSize(7).font('Helvetica')
        .text('Signature', signatureX + 130, signatureY - 25, { width: 60, align: 'center' });

      // ===== NUMÉRO D'ACTE (en bas) =====
      doc.fontSize(8).font('Helvetica')
        .fillColor('#666666')
        .text(`Numéro d'acte: ${acteNaissance.numeroActe}`, margin + 10, pageHeight - margin - 30, { width: contentWidth - 20, align: 'center' });

      doc.end();
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
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
        // URL de paiement externe (à intégrer avec les services de paiement réels)
        // Pour l'instant, null car on simule le paiement directement
        paymentUrl: null
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

    // Vérifier que le statut est "validee" ou "archivee"
    if (declaration.statut !== 'validee' && declaration.statut !== 'archivee') {
      return res.status(400).json({
        success: false,
        message: 'Le dossier doit être validé et archivé avant de pouvoir télécharger l\'acte de naissance'
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

