const express = require('express');
const router = express.Router();
const geographicController = require('../controllers/geographicController');

/**
 * @swagger
 * /api/geographic/regions:
 *   get:
 *     summary: Obtenir toutes les régions du Sénégal
 *     tags: [Géographie]
 *     responses:
 *       200:
 *         description: Liste des régions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       nom:
 *                         type: string
 *                       code:
 *                         type: string
 */
router.get('/regions', geographicController.getRegions);

/**
 * @swagger
 * /api/geographic/departements/{regionId}:
 *   get:
 *     summary: Obtenir tous les départements d'une région
 *     tags: [Géographie]
 *     parameters:
 *       - in: path
 *         name: regionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la région
 *     responses:
 *       200:
 *         description: Liste des départements
 */
router.get('/departements/:regionId', geographicController.getDepartementsByRegion);

/**
 * @swagger
 * /api/geographic/communes/{departementId}:
 *   get:
 *     summary: Obtenir toutes les communes d'un département
 *     tags: [Géographie]
 *     parameters:
 *       - in: path
 *         name: departementId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du département
 *     responses:
 *       200:
 *         description: Liste des communes
 */
router.get('/communes/:departementId', geographicController.getCommunesByDepartement);

/**
 * @swagger
 * /api/geographic/communaute-rurales/{departementId}:
 *   get:
 *     summary: Obtenir toutes les communautés rurales d'un département
 *     tags: [Géographie]
 *     parameters:
 *       - in: path
 *         name: departementId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du département
 *     responses:
 *       200:
 *         description: Liste des communautés rurales
 */
router.get('/communaute-rurales/:departementId', geographicController.getCommunautesRuralesByDepartement);

/**
 * @swagger
 * /api/geographic/hopitaux:
 *   get:
 *     summary: Obtenir tous les hôpitaux
 *     tags: [Géographie]
 *     parameters:
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *         description: Filtrer par région (optionnel)
 *     responses:
 *       200:
 *         description: Liste des hôpitaux
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       nom:
 *                         type: string
 *                       type:
 *                         type: string
 *                       adresse:
 *                         type: string
 */
router.get('/hopitaux', geographicController.getHopitaux);

module.exports = router;


