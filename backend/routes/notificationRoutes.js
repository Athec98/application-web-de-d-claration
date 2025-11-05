const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

// @route   GET /api/notifications
// @desc    Obtenir toutes les notifications de l'utilisateur
// @access  Private
router.get('/', auth, notificationController.getNotifications);

// @route   PUT /api/notifications/:id/read
// @desc    Marquer une notification comme lue
// @access  Private
router.put('/:id/read', auth, notificationController.markAsRead);

// @route   PUT /api/notifications/read-all
// @desc    Marquer toutes les notifications comme lues
// @access  Private
router.put('/read-all', auth, notificationController.markAllAsRead);

// @route   DELETE /api/notifications/:id
// @desc    Supprimer une notification
// @access  Private
router.delete('/:id', auth, notificationController.deleteNotification);

module.exports = router;
