const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendVerificationEmail } = require('../services/emailService');

// === Générer un token JWT ===
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// === Générer un code OTP ===
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// === Inscription ===
exports.register = async (req, res) => {
  try {
    const { name, firstName, lastName, email, phone, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email et mot de passe requis' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Cet email est déjà utilisé' });
    }

    const user = new User({
      name,
      firstName,
      lastName,
      email,
      phone,
      role: 'parent',
      isVerified: false,
      otp: generateOTP(),
      otpExpire: Date.now() + 10 * 60 * 1000
    });

    await user.setPassword(password);
    await user.save();

    try {
      await sendVerificationEmail(user.email, user.otp, user._id);
    } catch (err) {
      console.error('Erreur envoi email OTP :', err);
    }

    res.status(201).json({
      success: true,
      message: 'Inscription réussie. Vérifiez votre email pour le code OTP.',
      userId: user._id,  // Ajout de l'ID utilisateur à la racine de la réponse
      user: {
        id: user._id,
        email: user.email,
        name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur lors de l\'inscription' });
  }
};

// === Vérification OTP ===
exports.verifyOTP = async (req, res) => {
  try {
    console.log('Requête de vérification OTP reçue:', { body: req.body });
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      console.log('Champs manquants:', { userId: !!userId, otp: !!otp });
      return res.status(400).json({ success: false, message: 'ID utilisateur et OTP requis' });
    }

    const user = await User.findById(userId).select('+otp +otpExpire');
    console.log('Utilisateur trouvé:', { 
      userId: user?._id,
      hasOtp: !!user?.otp,
      otpExpire: user?.otpExpire,
      isExpired: user?.otpExpire < Date.now()
    });

    if (!user) {
      console.log('Utilisateur non trouvé pour l\'ID:', userId);
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    
    if (user.isVerified) {
      console.log('Utilisateur déjà vérifié:', user._id);
      return res.status(400).json({ success: false, message: 'Utilisateur déjà vérifié' });
    }
    
    if (user.otp !== otp) {
      console.log('OTP invalide:', { 
        expected: user.otp, 
        received: otp,
        match: user.otp === otp
      });
      return res.status(400).json({ success: false, message: 'OTP invalide' });
    }
    
    if (user.otpExpire < Date.now()) {
      console.log('OTP expiré:', { 
        now: new Date(),
        expire: new Date(user.otpExpire)
      });
      return res.status(400).json({ success: false, message: 'OTP expiré' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    const token = generateToken(user._id);

    res.json({ success: true, message: 'Email vérifié', token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur lors de la vérification OTP' });
  }
};

// === Connexion ===
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Tentative de connexion pour l\'email:', email);
    
    if (!email || !password) {
      console.log('Champs manquants:', { email: !!email, password: '***' });
      return res.status(400).json({ 
        success: false, 
        message: 'Email et mot de passe requis' 
      });
    }

    // Trouver l'utilisateur par email
    const user = await User.findOne({ email }).select('+password');
    console.log('Utilisateur trouvé:', user ? 'Oui' : 'Non');

    if (!user) {
      console.log('Aucun utilisateur trouvé avec cet email');
      return res.status(401).json({ 
        success: false, 
        message: 'Email ou mot de passe incorrect' 
      });
    }

    // Vérifier le mot de passe
    const isMatch = await user.matchPassword(password);
    console.log('Mot de passe valide:', isMatch);
    
    if (!isMatch) {
      console.log('Mot de passe incorrect');
      return res.status(401).json({ 
        success: false, 
        message: 'Email ou mot de passe incorrect' 
      });
    }

    // Vérifier si l'email est vérifié
    if (!user.isVerified) {
      console.log('Email non vérifié pour l\'utilisateur:', user._id);
      return res.status(403).json({ 
        success: false, 
        message: 'Veuillez vérifier votre email', 
        requiresVerification: true, 
        userId: user._id 
      });
    }

    const token = generateToken(user._id);
    
    // Créer un objet utilisateur sans les champs sensibles
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.otp;
    delete userResponse.otpExpire;
    
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
    const user = await User.findById(req.user.id).select('-password -otp -otpExpire');
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération du profil' });
  }
};

// === Mise à jour profil ===
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { firstName, lastName, phone, name: `${firstName} ${lastName}`.trim() },
      { new: true, runValidators: true }
    ).select('-password -otp -otpExpire');

    if (!updatedUser) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    res.json({ success: true, message: 'Profil mis à jour', user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour du profil' });
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

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Générer un nouveau code OTP
    user.otp = generateOTP();
    user.otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes d'expiration
    await user.save();

    // Envoyer le nouvel OTP par email
    try {
      await sendVerificationEmail(user.email, user.otp, user._id);
    } catch (emailError) {
      console.error('Erreur envoi email OTP (renvoi):', emailError);
      return res.status(500).json({
        success: false,
        message: 'Code OTP régénéré mais erreur lors de l\'envoi de l\'email',
        otp: process.env.NODE_ENV === 'development' ? user.otp : undefined
      });
    }

    res.json({
      success: true,
      message: 'Un nouveau code de vérification a été envoyé à votre adresse email',
      otp: process.env.NODE_ENV === 'development' ? user.otp : undefined
    });
  } catch (err) {
    console.error('Erreur renvoi OTP:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors du renvoi du code OTP',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// === Changer mot de passe ===
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Mot de passe actuel incorrect' });
    }

    await user.setPassword(newPassword);
    await user.save();
    res.json({ success: true, message: 'Mot de passe changé avec succès' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur lors du changement de mot de passe' });
  }
};
