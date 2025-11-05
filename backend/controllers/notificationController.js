const Notification = require('../models/Notification');

// @desc    Obtenir toutes les notifications de l'utilisateur
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const { lu, limit = 50 } = req.query;
    let query = { user: req.user.id };

    if (lu !== undefined) {
      query.lu = lu === 'true';
    }

    const notifications = await Notification.find(query)
      .populate('declaration', 'nomEnfant prenomEnfant statut')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    // Compter les notifications non lues
    const unreadCount = await Notification.countDocuments({ 
      user: req.user.id, 
      lu: false 
    });

    res.json({
      success: true,
      count: notifications.length,
      unreadCount,
      notifications
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// @desc    Marquer une notification comme lue
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification non trouvée'
      });
    }

    // Vérifier que la notification appartient à l'utilisateur
    if (notification.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé'
      });
    }

    notification.lu = true;
    notification.dateLecture = new Date();
    await notification.save();

    res.json({
      success: true,
      message: 'Notification marquée comme lue',
      notification
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la notification:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// @desc    Marquer toutes les notifications comme lues
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, lu: false },
      { 
        lu: true, 
        dateLecture: new Date() 
      }
    );

    res.json({
      success: true,
      message: 'Toutes les notifications ont été marquées comme lues'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// @desc    Supprimer une notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification non trouvée'
      });
    }

    // Vérifier que la notification appartient à l'utilisateur
    if (notification.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé'
      });
    }

    await Notification.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Notification supprimée'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la notification:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

