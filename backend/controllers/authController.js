const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');

// === Générer un token JWT ===
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// === Générer un code OTP ===
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// === Inscription ===
exports.register = async (req, res) => {
  try {
    const { name, firstName, lastName, email, phone, password, role = 'parent' } = req.body;
    
    // Validation des champs obligatoires
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email et mot de passe sont requis' 
      });
    }

    // Validation du mot de passe
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe doit contenir au moins 6 caractères'
      });
    }

    // Nettoyer l'email
    const cleanedEmail = email.trim().toLowerCase();
    
    // Vérifier si l'utilisateur existe déjà
    const userExists = await User.findOne({ email: cleanedEmail });
    if (userExists) {
      return res.status(400).json({ 
        success: false,
        message: 'Un compte existe déjà avec cet email'
      });
    }
    
    // Créer l'utilisateur
    const user = new User({
      name: name || `${firstName || ''} ${lastName || ''}`.trim(),
      firstName,
      lastName,
      email: cleanedEmail,
      phone,
      role: ['parent', 'hopital', 'mairie', 'admin'].includes(role) ? role : 'parent',
      isVerified: false,
      otp: generateOTP(),
      otpExpire: Date.now() + 10 * 60 * 1000 // 10 minutes
    });

    // Définir et hacher le mot de passe
    await user.setPassword(password);
    await user.save();

    // Envoyer l'email de vérification (en arrière-plan, ne pas attendre)
    sendVerificationEmail(user.email, user.otp, user._id)
      .catch(error => console.error('Erreur envoi email OTP:', error));

    // Réponse sans données sensibles
    const userResponse = {
      id: user._id,
      email: user.email,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isVerified: user.isVerified
    };

    res.status(201).json({
      success: true,
      message: 'Inscription réussie. Vérifiez votre email pour le code OTP.',
      user: userResponse
    });
  } catch (err) {
    console.error('Erreur inscription:', err);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur lors de l\'inscription' 
    });
  }
};

// === Vérification OTP ===
exports.verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const requestIP = req.ip || req.connection.remoteAddress;
    
    // Journalisation sécurisée
    console.log(`Tentative de vérification OTP depuis IP: ${requestIP}`);
    console.log('Détails de la requête:', { 
      hasUserId: !!userId, 
      hasOtp: !!otp,
      timestamp: new Date().toISOString()
    });

    // Validation des entrées
    if (!userId || !otp) {
      console.log('Échec de vérification: champs manquants');
      return res.status(400).json({ 
        success: false, 
        message: 'ID utilisateur et code OTP requis' 
      });
    }

    // Recherche de l'utilisateur avec gestion d'erreur
    let user;
    try {
      user = await User.findById(userId).select('+otp +otpExpire +isVerified');
    } catch (error) {
      console.error('Erreur lors de la recherche de l\'utilisateur:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la vérification' 
      });
    }

    // Réponse générique pour éviter les fuites d'informations
    const genericErrorResponse = { 
      success: false, 
      message: 'Le code de vérification est invalide ou a expiré' 
    };

    if (!user) {
      console.log('Tentative de vérification avec un ID utilisateur invalide');
      return res.status(400).json(genericErrorResponse);
    }
    
    // Journalisation sécurisée
    console.log(`Tentative de vérification pour l'utilisateur: ${user._id}`, {
      isVerified: user.isVerified,
      hasOtp: !!user.otp,
      otpExpired: user.otpExpire ? (user.otpExpire < Date.now()) : 'N/A'
    });
    
    // Vérifier si l'utilisateur est déjà vérifié
    if (user.isVerified) {
      console.log(`L'utilisateur ${user._id} est déjà vérifié`);
      return res.status(200).json({ 
        success: true, 
        message: 'Votre compte est déjà vérifié',
        alreadyVerified: true
      });
    }
    
    // Vérifier l'OTP avec une comparaison en temps constant
    const isOtpValid = user.otp && user.otpExpire && 
                       user.otpExpire > Date.now() && 
                       user.otp === otp;
    
    if (!isOtpValid) {
      console.log('Échec de la vérification OTP', {
        expectedLength: user.otp ? user.otp.length : 0,
        receivedLength: otp ? otp.length : 0,
        isExpired: user.otpExpire ? (user.otpExpire <= Date.now()) : true
      });
      return res.status(400).json(genericErrorResponse);
    }

    // Mettre à jour l'utilisateur
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    // Récupérer l'utilisateur avec les champs mis à jour
    const updatedUser = await User.findById(user._id)
      .select('-passwordHash -otp -otpExpire -resetPasswordToken -resetPasswordExpire');

    const token = generateToken(user._id);

    // Retourner les informations complètes de l'utilisateur
    res.json({ 
      success: true, 
      message: 'Email vérifié', 
      token, 
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        isVerified: updatedUser.isVerified,
        address: updatedUser.address
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur lors de la vérification OTP' });
  }
};

// === Connexion ===
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const requestIP = req.ip || req.connection.remoteAddress;
    
    // Journalisation sécurisée
    console.log(`Tentative de connexion depuis IP: ${requestIP}`);
    console.log('Détails de la requête:', {
      hasEmail: !!email,
      hasPassword: !!password,
      timestamp: new Date().toISOString()
    });
    
    // Validation des champs
    if (!email || !password) {
      console.log('Échec de la connexion: email ou mot de passe manquant');
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe sont requis'
      });
    }
    
    // Nettoyer l'email
    const cleanedEmail = email.trim().toLowerCase();
    
    // Trouver l'utilisateur avec les champs nécessaires
    const user = await User.findOne({ email: cleanedEmail })
      .select('+passwordHash +loginAttempts +lockUntil +isVerified');
    
    // Réponse générique pour éviter les fuites d'informations
    const errorResponse = {
      success: false,
      message: 'Email ou mot de passe incorrect. Vérifiez vos identifiants ou créez un compte si vous n\'en avez pas encore.'
    };
    
    // Vérifier si l'utilisateur existe
    if (!user) {
      console.log(`Aucun utilisateur trouvé avec l'email: ${cleanedEmail}`);
      // Vérifier si c'est probablement une faute de frappe courante (gail.com vs gmail.com)
      if (cleanedEmail.includes('@gail.com')) {
        console.log('⚠️  Email suspecté d\'être une faute de frappe: gail.com au lieu de gmail.com');
      }
      return res.status(401).json(errorResponse);
    }
    
    // Vérifier si le compte est verrouillé
    if (user.isLocked) {
      const timeLeft = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
      console.log(`Tentative de connexion avec un compte verrouillé: ${user._id}`);
      
      return res.status(423).json({
        success: false,
        message: `Trop de tentatives. Réessayez dans ${timeLeft} minutes.`
      });
    }
    
    // Vérifier le mot de passe
    const isMatch = await user.matchPassword(password);
    
    if (!isMatch) {
      // Incrémenter le compteur de tentatives échouées
      await user.incLoginAttempts();
      
      // Récupérer le nombre de tentatives restantes
      const updatedUser = await User.findById(user._id).select('+loginAttempts +lockUntil');
      const attemptsLeft = 4 - (updatedUser.loginAttempts || 0);
      
      console.log(`Échec de l'authentification pour l'utilisateur: ${user._id}`);
      console.log(`Tentatives restantes: ${attemptsLeft}`);
      
      return res.status(401).json({
        success: false,
        message: `Identifiants invalides. ${attemptsLeft > 0 ? attemptsLeft + ' tentatives restantes.' : 'Compte verrouillé.'}`
      });
    }
    
    // Vérifier si l'email est vérifié
    if (!user.isVerified) {
      console.log(`Tentative de connexion avec un email non vérifié: ${user._id}`);
      
      return res.status(403).json({
        success: false,
        message: 'Veuillez vérifier votre email avant de vous connecter',
        requiresVerification: true,
        userId: user._id
      });
    }
    
    // Réinitialiser les tentatives de connexion en cas de succès
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }
    
    // Générer le token JWT
    const token = generateToken(user._id);
    
    // Créer la réponse utilisateur sans données sensibles
    const userResponse = {
      id: user._id,
      email: user.email,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isVerified: user.isVerified
    };
    
    // Journalisation de la connexion réussie
    console.log(`Connexion réussie pour l'utilisateur: ${user._id}`);
    
    // Envoyer la réponse avec le token
    res.json({
      success: true,
      token,
      user: userResponse
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur lors de la connexion' });
  }
};

// === Récupérer l'utilisateur connecté ===
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (err) {
    console.error('Erreur récupération profil:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération du profil'
    });
  }
};

// === Mise à jour profil ===
exports.updateProfile = async (req, res) => {
  try {
    const { name, firstName, lastName, phone } = req.body;
    
    // Mettre à jour uniquement les champs fournis
    const updateFields = {};
    if (name) updateFields.name = name;
    if (firstName) updateFields.firstName = firstName;
    if (lastName) updateFields.lastName = lastName;
    if (phone) updateFields.phone = phone;
    
    // Si le nom complet n'est pas fourni mais que le prénom ou le nom le sont, mettre à jour le nom complet
    if ((firstName || lastName) && !name) {
      updateFields.name = `${firstName || ''} ${lastName || ''}`.trim();
    }
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateFields,
      { 
        new: true,
        runValidators: true,
        select: '-passwordHash -otp -otpExpire -loginAttempts -lockUntil -resetPasswordToken -resetPasswordExpire'
      }
    );
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (err) {
    console.error('Erreur mise à jour profil:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour du profil'
    });
  }
};

// === Renvoyer un nouvel OTP ===
exports.resendOTP = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'ID utilisateur requis pour le renvoi du code OTP'
      });
    }

    // Rechercher l'utilisateur
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
        message: 'Votre compte est déjà vérifié'
      });
    }

    // Générer un nouvel OTP
    user.otp = generateOTP();
    user.otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    await user.save();

    // Envoyer le nouvel OTP par email (en arrière-plan)
    sendVerificationEmail(user.email, user.otp, user._id)
      .catch(error => console.error('Erreur envoi email OTP:', error));

    res.json({
      success: true,
      message: 'Un nouveau code de vérification a été envoyé à votre adresse email'
    });
  } catch (err) {
    console.error('Erreur renvoi OTP:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors du renvoi du code OTP'
    });
  }
};

// === Changer le mot de passe ===
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validation des champs
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir l\'ancien et le nouveau mot de passe'
      });
    }

    // Vérifier la longueur du nouveau mot de passe
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Le nouveau mot de passe doit contenir au moins 6 caractères'
      });
    }

    // Récupérer l'utilisateur avec le mot de passe
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
        message: 'L\'ancien mot de passe est incorrect'
      });
    }

    // Mettre à jour le mot de passe
    await user.setPassword(newPassword);
    await user.save();

    // Envoyer une notification (en arrière-plan)
    try {
      await sendPasswordResetEmail(user.email, 'Votre mot de passe a été modifié avec succès');
    } catch (err) {
      console.error('Erreur envoi email confirmation changement mot de passe:', err);
    }

    res.json({
      success: true,
      message: 'Votre mot de passe a été modifié avec succès'
    });
  } catch (err) {
    console.error('Erreur changement mot de passe:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors du changement de mot de passe'
    });
  }
};
