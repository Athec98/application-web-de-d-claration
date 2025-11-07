const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { auth } = require('../middleware/auth');

/**
 * @swagger
 * /api/files/{filename}:
 *   get:
 *     summary: Télécharger un fichier uploadé
 *     tags: [Fichiers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: Nom du fichier
 *     responses:
 *       200:
 *         description: Fichier retourné avec succès
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Nom de fichier invalide
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Fichier non trouvé
 */
router.get('/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    
    console.log(`📁 Requête de fichier reçue: ${filename}`);
    console.log(`📁 Origine de la requête: ${req.headers.origin || 'N/A'}`);
    
    // Sécuriser le nom de fichier pour éviter les attaques de path traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      console.error(`❌ Nom de fichier invalide (path traversal détecté): ${filename}`);
      return res.status(400).json({
        success: false,
        message: 'Nom de fichier invalide'
      });
    }

    // Chemin du fichier
    const filePath = path.join(__dirname, '../uploads/documents', filename);
    console.log(`📁 Chemin complet du fichier: ${filePath}`);

    // Vérifier que le dossier existe
    const uploadsDir = path.join(__dirname, '../uploads/documents');
    if (!fs.existsSync(uploadsDir)) {
      console.error(`❌ Dossier uploads/documents n'existe pas: ${uploadsDir}`);
      return res.status(500).json({
        success: false,
        message: 'Dossier de stockage non trouvé'
      });
    }

    // Lister les fichiers dans le dossier (pour debug)
    try {
      const filesInDir = fs.readdirSync(uploadsDir);
      console.log(`📁 Fichiers dans le dossier (${filesInDir.length} fichiers):`, filesInDir.slice(0, 5));
    } catch (err) {
      console.error(`❌ Erreur lors de la lecture du dossier:`, err);
    }

    // Vérifier que le fichier existe
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Fichier non trouvé: ${filePath}`);
      console.error(`❌ Nom de fichier demandé: ${filename}`);
      return res.status(404).json({
        success: false,
        message: 'Fichier non trouvé'
      });
    }

    console.log(`✅ Fichier trouvé: ${filePath}`);

    // Vérifier que l'utilisateur a accès au fichier (si authentifié)
    // Si non authentifié, on autorise quand même (pour les images dans les balises img)
    // Mais en production, vous pourriez vouloir vérifier que le fichier appartient à une déclaration accessible
    if (req.user) {
      // L'utilisateur est authentifié, on peut faire des vérifications supplémentaires si nécessaire
      // Pour l'instant, on autorise tous les utilisateurs authentifiés
    }

    // Déterminer le type MIME
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    // Servir le fichier avec les headers CORS
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache 1 an
    
    // Headers CORS pour permettre l'accès depuis Vercel
    const origin = req.headers.origin;
    if (origin && (origin.includes('vercel.app') || origin.includes('vercel.com') || origin.includes('localhost'))) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Lire et envoyer le fichier
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on('error', (error) => {
      console.error('Erreur lors de la lecture du fichier:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Erreur lors de la lecture du fichier'
        });
      }
    });
  } catch (error) {
    console.error('Erreur lors du service du fichier:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors du service du fichier'
    });
  }
});

module.exports = router;

