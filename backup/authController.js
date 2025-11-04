const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Générer un token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// Générer un code OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Inscription d'un parent
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phoneNumber, password, address } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Ce numéro de téléphone est déjà utilisé'
      });
    }

    // Générer OTP
    const otpCode = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Créer l'utilisateur
    const user = await User.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
      address,
      role: 'parent',
      otp: {
        code: otpCode,
        expiresAt: otpExpires
      }
    });

    // TODO: Envoyer OTP par SMS/Email
    console.log(`📱 Code OTP pour ${phoneNumber}: ${otpCode}`);

    res.status(201).json({
      success: true,
      message: 'Inscription réussie. Un code OTP a été envoyé à votre numéro.',
      data: {
        userId: user._id,
        phoneNumber: user.phoneNumber
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Vérifier le code OTP
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res, next) => {
  try {
    const { phoneNumber, otpCode } = req.body;

    const user = await User.findOne({ phoneNumber });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    if (!user.otp || !user.otp.code) {
      return res.status(400).json({
        success: false,
        message: 'Aucun code OTP trouvé'
      });
    }

    if (user.otp.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Le code OTP a expiré'
      });
    }

    if (user.otp.code !== otpCode) {
      return res.status(400).json({
        success: false,
        message: 'Code OTP invalide'
      });
    }

    // Activer le compte
    user.isVerified = true;
    user.otp = undefined;
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Compte vérifié avec succès',
      data: {
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Connexion
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { identifier, password, role } = req.body; // identifier = email ou phoneNumber

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir un email/téléphone et un mot de passe'
      });
    }

    // Chercher l'utilisateur par email ou téléphone
    const user = await User.findOne({
      $or: [{ email: identifier }, { phoneNumber: identifier }],
      role: role
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides'
      });
    }

    // Vérifier le mot de passe
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides'
      });
    }

    // Vérifier si le compte est vérifié (pour les parents)
    if (user.role === 'parent' && !user.isVerified) {
      return res.status(401).json({
        success: false,
        message: 'Veuillez vérifier votre compte avec le code OTP'
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      data: {
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir l'utilisateur connecté
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mettre à jour le profil
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phoneNumber, address } = req.body;

    const user = await User.findById(req.user.id);

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (address) user.address = address;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profil mis à jour avec succès',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Changer le mot de passe
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);

    // Vérifier le mot de passe actuel
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Mot de passe actuel incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Mot de passe modifié avec succès'
    });
  } catch (error) {
    next(error);
  }
};
