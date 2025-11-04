// === Mise à jour du profil utilisateur ===
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone } = req.body;
    const userId = req.user.id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        firstName,
        lastName,
        phone,
        name: `${firstName} ${lastName}`.trim()
      },
      { new: true, runValidators: true }
    ).select('-password -otp -otpExpire');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      user: updatedUser
    });
  } catch (err) {
    console.error('Erreur mise à jour profil :', err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour du profil',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
