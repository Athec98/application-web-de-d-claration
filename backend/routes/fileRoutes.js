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
router.get('/:filename', auth, (req, res) => {
  try {
    const filename = req.params.filename;
    
    // Sécuriser le nom de fichier pour éviter les attaques de path traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({
        success: false,
        message: 'Nom de fichier invalide'
      });
    }

    // Chemin du fichier
    const filePath = path.join(__dirname, '../uploads/documents', filename);

    // Vérifier que le fichier existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Fichier non trouvé'
      });
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

    // Servir le fichier
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache 1 an
    
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

