const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const acteNaissanceController = require('../controllers/acteNaissanceController');

// IMPORTANT: Les routes spécifiques doivent être définies AVANT les routes génériques /:id
// Sinon, Express.js capturera les routes spécifiques comme des paramètres

/**
 * @swagger
 * /api/actes-naissance/generate/{declarationId}:
 *   post:
 *     summary: Générer un acte de naissance (Mairie uniquement)
 *     tags: [Actes de Naissance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: declarationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la déclaration
 *     responses:
 *       201:
 *         description: Acte de naissance généré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ActeNaissance'
 *       400:
 *         description: Erreur de validation
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès réservé à la mairie
 */
router.post('/generate/:declarationId', auth, acteNaissanceController.generateActeNaissance);

/**
 * @swagger
 * /api/actes-naissance/payment/confirm/{reference}:
 *   post:
 *     summary: Confirmer le paiement et télécharger l'acte (Parent uniquement)
 *     tags: [Actes de Naissance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reference
 *         required: true
 *         schema:
 *           type: string
 *         description: Référence du paiement
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *             properties:
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Paiement confirmé, fichier PDF retourné
 *       400:
 *         description: Erreur de validation
 *       401:
 *         description: Non authentifié
 */
router.post('/payment/confirm/:reference', auth, acteNaissanceController.confirmPaymentAndDownload);

/**
 * @swagger
 * /api/actes-naissance/download/{id}:
 *   get:
 *     summary: Télécharger l'acte de naissance (après paiement)
 *     tags: [Actes de Naissance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'acte de naissance
 *     responses:
 *       200:
 *         description: Fichier PDF de l'acte de naissance
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Acte non trouvé
 */
router.get('/download/:id', auth, acteNaissanceController.downloadActeNaissance);

/**
 * @swagger
 * /api/actes-naissance/{id}/payment:
 *   post:
 *     summary: Initier le paiement pour télécharger l'acte (Parent uniquement)
 *     tags: [Actes de Naissance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'acte de naissance
 *     responses:
 *       200:
 *         description: Paiement initié avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 paymentUrl:
 *                   type: string
 *                   description: URL de paiement
 *                 reference:
 *                   type: string
 *                   description: Référence du paiement
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Acte non trouvé
 */
router.post('/:id/payment', auth, acteNaissanceController.initiatePayment);

/**
 * @swagger
 * /api/actes-naissance/{id}:
 *   get:
 *     summary: Obtenir les informations d'un acte de naissance
 *     tags: [Actes de Naissance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'acte de naissance
 *     responses:
 *       200:
 *         description: Informations de l'acte de naissance
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ActeNaissance'
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Acte non trouvé
 */
router.get('/:id', auth, acteNaissanceController.getActeNaissance);

module.exports = router;

