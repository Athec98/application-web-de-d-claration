const express = require('express');
const router = express.Router();
const mairieController = require('../controllers/mairieController');

/**
 * @swagger
 * /api/mairies:
 *   get:
 *     summary: Obtenir toutes les mairies
 *     tags: [Mairie]
 *     responses:
 *       200:
 *         description: Liste des mairies
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
 *                       adresse:
 *                         type: string
 *                       telephone:
 *                         type: string
 *                       email:
 *                         type: string
 */
router.get('/', mairieController.getMairies);

/**
 * @swagger
 * /api/mairies/region/{regionId}:
 *   get:
 *     summary: Obtenir les mairies d'une région
 *     tags: [Mairie]
 *     parameters:
 *       - in: path
 *         name: regionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la région
 *     responses:
 *       200:
 *         description: Liste des mairies de la région
 */
router.get('/region/:regionId', mairieController.getMairiesByRegion);

/**
 * @swagger
 * /api/mairies/departement/{departementId}:
 *   get:
 *     summary: Obtenir les mairies d'un département
 *     tags: [Mairie]
 *     parameters:
 *       - in: path
 *         name: departementId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du département
 *     responses:
 *       200:
 *         description: Liste des mairies du département
 */
router.get('/departement/:departementId', mairieController.getMairiesByDepartement);

/**
 * @swagger
 * /api/mairies/{id}:
 *   get:
 *     summary: Obtenir une mairie par ID
 *     tags: [Mairie]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la mairie
 *     responses:
 *       200:
 *         description: Informations de la mairie
 *       404:
 *         description: Mairie non trouvée
 */
router.get('/:id', mairieController.getMairieById);

module.exports = router;

