const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

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
    const { name, firstName, lastName, email, phone, password } = req.body;

    // Validation des champs requis
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir un email et un mot de passe'
      });
    }

    // Vérifier si l'utilisateur existe déjà
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà utilisé'
      });
    }

    // Créer un nouvel utilisateur
    const user = new User({
      name,
      firstName,
      lastName,
      email,
      phone,
      role: 'parent',
      isVerified: false,
      otp: generateOTP(),
      otpExpire: Date.now() + 10 * 60 * 1000, // 10 minutes
      passwordHash: password // Le middleware pre-save va hacher ce mot de passe
    });

    // Sauvegarder l'utilisateur
    await user.save();

    // Envoyer l'OTP par email ou SMS
    // À implémenter : logique d'envoi d'OTP
    console.log('OTP pour la vérification:', user.otp);

    // Réponse sans envoyer les données sensibles
    const userResponse = {
      id: user._id,
      email: user.email,
      name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      role: user.role,
      isVerified: user.isVerified
    };

    res.status(201).json({
      success: true,
      message: 'Inscription réussie. Veuillez vérifier votre email pour le code OTP.',
      user: userResponse
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// @desc    Vérifier le code OTP
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res, next) => {
  try {
    const { userId, otp } = req.body;

    // Validation des champs requis
    if (!userId || !otp) {
      return res.status(400).json({
        success: false,
        message: 'ID utilisateur et code OTP sont requis'
      });
    }

    // Vérifier si l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Vérifier si l'utilisateur est déjà vérifié
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Cet utilisateur est déjà vérifié'
      });
    }

    // Vérifier si l'OTP est valide
    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Code OTP invalide'
      });
    }

    // Vérifier si l'OTP a expiré
    if (user.otpExpire < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'Le code OTP a expiré. Veuillez en demander un nouveau.'
      });
    }

    // Mettre à jour l'utilisateur comme vérifié
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;
    
    await user.save();

    // Générer un token JWT
    const token = generateToken(user._id);

    // Créer un objet utilisateur pour la réponse
    const userResponse = {
      id: user._id,
      email: user.email,
      name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
      isVerified: user.isVerified
    };

    res.json({
      success: true,
      message: 'Email vérifié avec succès',
      token,
      user: userResponse
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// @desc    Connexion
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Veuillez fournir un email et un mot de passe' 
      });
    }

    // Trouver l'utilisateur avec le mot de passe haché
    const user = await User.findOne({ email }).select('+passwordHash');
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Identifiants invalides' 
      });
    }

    // Vérifier le mot de passe
    const isMatch = await user.matchPassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Identifiants invalides' 
      });
    }

    // Vérifier si l'email est vérifié
    if (!user.isVerified) {
      return res.status(403).json({ 
        success: false,
        message: 'Veuillez vérifier votre email avant de vous connecter',
        requiresVerification: true,
        userId: user._id
      });
    }

    // Générer un token JWT
    const token = generateToken(user._id);

    // Créer un objet utilisateur pour la réponse (sans le mot de passe)
    const userResponse = {
      id: user._id,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      address: user.address
    };

    res.json({
      success: true,
      token,
      user: userResponse
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// @desc    Obtenir l'utilisateur connecté
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Créer un objet utilisateur pour la réponse
    const userResponse = {
      id: user._id,
      email: user.email,
      name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      address: user.address,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt
    };
    
    res.json({
      success: true,
      user: userResponse
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur lors de la récupération du profil utilisateur' 
    });
  }
};

// @desc    Mettre à jour le profil
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, firstName, lastName, phone, address } = req.body;
    
    // Champs autorisés à être mis à jour
    const updateFields = {};
    
    if (name !== undefined) updateFields.name = name;
    if (firstName !== undefined) updateFields.firstName = firstName;
    if (lastName !== undefined) updateFields.lastName = lastName;
    if (phone !== undefined) updateFields.phone = phone;
    if (address !== undefined) updateFields.address = address;
    
    // Vérifier s'il y a des champs à mettre à jour
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucune donnée à mettre à jour'
      });
    }
    
    // Mettre à jour l'utilisateur
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Créer un objet utilisateur pour la réponse
    const userResponse = {
      id: user._id,
      email: user.email,
      name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      address: user.address,
      role: user.role,
      isVerified: user.isVerified
    };

    res.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      user: userResponse
    });
  } catch (err) {
    console.error(err);
    
    // Gérer les erreurs de validation
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: 'Erreur de validation',
        errors: messages
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur lors de la mise à jour du profil' 
    });
  }
};

// @desc    Changer le mot de passe
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
try {
const { currentPassword, newPassword } = req.body;
  
// Validation des champs requis
if (!currentPassword || !newPassword) {
  return res.status(400).json({
    success: false,
    message: 'Veuillez fournir le mot de passe actuel et le nouveau mot de passe'
  });
}
  
// Vérifier la longueur minimale du nouveau mot de passe
if (newPassword.length < 6) {
  return res.status(400).json({
    success: false,
    message: 'Le nouveau mot de passe doit contenir au moins 6 caractères'
  });
}
  
// Trouver l'utilisateur avec le mot de passe haché
const user = await User.findById(req.user.id).select('+passwordHash');
  
if (!user) {
  return res.status(404).json({
    success: false,
    message: 'Utilisateur non trouvé'
  });
}
  
// Vérifier l'ancien mot de passe
const isMatch = await user.matchPassword(currentPassword);
if (!isMatch) {
  return res.status(401).json({ 
    success: false,
    message: 'Le mot de passe actuel est incorrect' 
  });
}
  
// Mettre à jour le mot de passe (sera haché par le middleware pre-save)
user.password = newPassword;
await user.save();
  
// Générer un nouveau token
const token = generateToken(user._id);
  
// Créer un objet utilisateur pour la réponse
const userResponse = {
  id: user._id,
  email: user.email,
  name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
  role: user.role,
  isVerified: user.isVerified
};
  
res.json({
  success: true,
  message: 'Mot de passe mis à jour avec succès',
  token,
  user: userResponse
});
} catch (err) {
console.error(err);
  
// Gérer les erreurs de validation
if (err.name === 'ValidationError') {
  const messages = Object.values(err.errors).map(val => val.message);
  return res.status(400).json({
    success: false,
    message: 'Erreur de validation',
    errors: messages
  });
}
  
res.status(500).json({ 
  success: false,
  message: 'Erreur serveur lors du changement de mot de passe' 
});
}
};
