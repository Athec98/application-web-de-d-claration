const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { auth } = require('../middleware/auth');
const declarationController = require('../controllers/declarationController');
const { uploadDocuments } = require('../middleware/upload');

/**
 * @swagger
 * /api/declarations:
 *   post:
 *     summary: Créer une nouvelle déclaration de naissance
 *     tags: [Declarations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - nomEnfant
 *               - prenomEnfant
 *               - dateNaissance
 *               - lieuNaissance
 *               - sexe
 *               - nomPere
 *               - nomMere
 *               - region
 *               - departement
 *               - mairie
 *             properties:
 *               nomEnfant:
 *                 type: string
 *               prenomEnfant:
 *                 type: string
 *               dateNaissance:
 *                 type: string
 *                 format: date
 *               sexe:
 *                 type: string
 *                 enum: [M, F]
 *               region:
 *                 type: string
 *               departement:
 *                 type: string
 *               mairie:
 *                 type: string
 *               certificatAccouchement:
 *                 type: file
 *     responses:
 *       201:
 *         description: Déclaration créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Declaration'
 *       400:
 *         description: Erreur de validation
 *       401:
 *         description: Non authentifié
 */
router.post(
  '/',
  [
    auth,
    uploadDocuments, // Middleware pour uploader les fichiers
    [
      check('nomEnfant', 'Le nom de l\'enfant est requis').not().isEmpty(),
      check('prenomEnfant', 'Le prénom de l\'enfant est requis').not().isEmpty(),
      check('dateNaissance', 'La date de naissance est requise').not().isEmpty(),
      check('lieuNaissance', 'Le lieu de naissance est requis').not().isEmpty(),
      check('sexe', 'Le sexe est requis').not().isEmpty(),
      check('nomPere', 'Le nom du père est requis').not().isEmpty(),
      check('nomMere', 'Le nom de la mère est requis').not().isEmpty(),
      check('region', 'La région est requise').not().isEmpty(),
      check('departement', 'Le département est requis').not().isEmpty(),
      check('mairie', 'La mairie est requise').not().isEmpty(),
      check('certificatAccouchement.numero', 'Le numéro du certificat d\'accouchement est requis').not().isEmpty(),
      check('certificatAccouchement.dateDelivrance', 'La date de délivrance du certificat est requise').not().isEmpty()
    ]
  ],
  declarationController.createDeclaration
);

/**
 * @swagger
 * /api/declarations:
 *   get:
 *     summary: Obtenir toutes les déclarations (filtrées selon le rôle)
 *     tags: [Declarations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: statut
 *         schema:
 *           type: string
 *         description: Filtrer par statut
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Nombre d'éléments par page
 *     responses:
 *       200:
 *         description: Liste des déclarations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Declaration'
 *       401:
 *         description: Non authentifié
 */
router.get('/', auth, declarationController.getDeclarations);

// IMPORTANT: Les routes spécifiques doivent être définies AVANT les routes génériques /:id
// Sinon, Express.js capturera les routes spécifiques comme des paramètres

/**
 * @swagger
 * /api/declarations/my-declarations:
 *   get:
 *     summary: Obtenir toutes les déclarations d'un parent
 *     tags: [Declarations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des déclarations du parent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Declaration'
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès réservé aux parents
 */
router.get('/my-declarations', auth, declarationController.getMyDeclarations);

/**
 * @swagger
 * /api/declarations/mairie/all:
 *   get:
 *     summary: Obtenir toutes les déclarations pour la mairie
 *     tags: [Declarations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des déclarations pour la mairie
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès réservé à la mairie
 */
router.get('/mairie/all', auth, declarationController.getDeclarations);

/**
 * @swagger
 * /api/declarations/hopital/verifications:
 *   get:
 *     summary: Obtenir les demandes de vérification pour l'hôpital
 *     tags: [Declarations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des demandes de vérification
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès réservé à l'hôpital
 */
router.get('/hopital/verifications', auth, declarationController.getVerificationRequests);

/**
 * @swagger
 * /api/declarations/hopital/all:
 *   get:
 *     summary: Obtenir toutes les déclarations traitées par l'hôpital
 *     tags: [Declarations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des déclarations de l'hôpital
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès réservé à l'hôpital
 */
router.get('/hopital/all', auth, declarationController.getAllHospitalDeclarations);

/**
 * @swagger
 * /api/declarations/{id}/suggested-hospitals:
 *   get:
 *     summary: Obtenir les hôpitaux suggérés pour une déclaration
 *     tags: [Declarations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la déclaration
 *     responses:
 *       200:
 *         description: Liste des hôpitaux suggérés
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès réservé à la mairie
 */
router.get('/:id/suggested-hospitals', auth, declarationController.getSuggestedHospitals);

/**
 * @swagger
 * /api/declarations/{id}:
 *   get:
 *     summary: Obtenir une déclaration par ID
 *     tags: [Declarations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la déclaration
 *     responses:
 *       200:
 *         description: Déclaration trouvée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Declaration'
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Déclaration non trouvée
 */
router.get('/:id', auth, declarationController.getDeclarationById);

/**
 * @swagger
 * /api/declarations/{id}/send-to-hospital:
 *   put:
 *     summary: Envoyer la déclaration à l'hôpital pour vérification (Mairie uniquement)
 *     tags: [Declarations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la déclaration
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - hopitalId
 *             properties:
 *               hopitalId:
 *                 type: string
 *                 description: ID de l'hôpital assigné
 *     responses:
 *       200:
 *         description: Déclaration envoyée à l'hôpital avec succès
 *       400:
 *         description: Erreur de validation
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès réservé à la mairie
 *       404:
 *         description: Déclaration non trouvée
 */
router.put('/:id/send-to-hospital', auth, declarationController.sendToHospital);

/**
 * @swagger
 * /api/declarations/{id}/validate:
 *   put:
 *     summary: Valider une déclaration (Mairie uniquement, après validation du certificat par l'hôpital)
 *     tags: [Declarations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la déclaration
 *     responses:
 *       200:
 *         description: Déclaration validée avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès réservé à la mairie
 *       404:
 *         description: Déclaration non trouvée
 */
router.put('/:id/validate', auth, declarationController.validateDeclaration);

/**
 * @swagger
 * /api/declarations/{id}/reject:
 *   put:
 *     summary: Rejeter une déclaration (Mairie uniquement)
 *     tags: [Declarations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la déclaration
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - motifRejet
 *             properties:
 *               motifRejet:
 *                 type: string
 *                 description: Motif du rejet
 *     responses:
 *       200:
 *         description: Déclaration rejetée avec succès
 *       400:
 *         description: Motif de rejet requis
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès réservé à la mairie
 *       404:
 *         description: Déclaration non trouvée
 */
router.put('/:id/reject', auth, declarationController.rejectDeclaration);

/**
 * @swagger
 * /api/declarations/{id}/validate-certificate:
 *   put:
 *     summary: Valider le certificat d'accouchement (Hôpital uniquement)
 *     tags: [Declarations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la déclaration
 *     responses:
 *       200:
 *         description: Certificat validé avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès réservé à l'hôpital
 *       404:
 *         description: Déclaration non trouvée
 */
router.put('/:id/validate-certificate', auth, declarationController.validateCertificate);

/**
 * @swagger
 * /api/declarations/{id}/reject-certificate:
 *   put:
 *     summary: Rejeter le certificat d'accouchement (Hôpital uniquement)
 *     tags: [Declarations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la déclaration
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - motifRejet
 *             properties:
 *               motifRejet:
 *                 type: string
 *                 description: Motif du rejet du certificat
 *     responses:
 *       200:
 *         description: Certificat rejeté avec succès
 *       400:
 *         description: Motif de rejet requis
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès réservé à l'hôpital
 *       404:
 *         description: Déclaration non trouvée
 */
router.put('/:id/reject-certificate', auth, declarationController.rejectCertificate);

/**
 * @swagger
 * /api/declarations/{id}/archive:
 *   put:
 *     summary: Archiver une déclaration (Mairie uniquement)
 *     tags: [Declarations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la déclaration
 *     responses:
 *       200:
 *         description: Déclaration archivée avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès réservé à la mairie
 *       404:
 *         description: Déclaration non trouvée
 */
router.put('/:id/archive', auth, declarationController.archiveDeclaration);

/**
 * @swagger
 * /api/declarations/{id}:
 *   put:
 *     summary: Mettre à jour une déclaration (Parent uniquement, statut "en cours")
 *     tags: [Declarations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la déclaration
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nomEnfant:
 *                 type: string
 *               prenomEnfant:
 *                 type: string
 *     responses:
 *       200:
 *         description: Déclaration mise à jour avec succès
 *       400:
 *         description: Erreur de validation ou statut non autorisé
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Déclaration non trouvée
 */
router.put(
  '/:id',
  [
    auth,
    uploadDocuments, // Middleware pour uploader les fichiers
    [
      check('nomEnfant', 'Le nom de l\'enfant est requis').not().isEmpty(),
      check('prenomEnfant', 'Le prénom de l\'enfant est requis').not().isEmpty(),
      check('dateNaissance', 'La date de naissance est requise').not().isEmpty(),
      check('lieuNaissance', 'Le lieu de naissance est requis').not().isEmpty(),
      check('sexe', 'Le sexe est requis').not().isEmpty(),
      check('nomPere', 'Le nom du père est requis').not().isEmpty(),
      check('nomMere', 'Le nom de la mère est requis').not().isEmpty(),
      check('region', 'La région est requise').not().isEmpty(),
      check('departement', 'Le département est requis').not().isEmpty(),
      check('mairie', 'La mairie est requise').not().isEmpty(),
      check('certificatAccouchement.numero', 'Le numéro du certificat d\'accouchement est requis').not().isEmpty(),
      check('certificatAccouchement.dateDelivrance', 'La date de délivrance du certificat est requise').not().isEmpty()
    ]
  ],
  declarationController.updateDeclaration
);

module.exports = router;
