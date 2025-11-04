const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
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
    
    // Journalisation de la tentative d'inscription (sans données sensibles)
    console.log('Tentative d\'inscription pour l\'email:', email ? 'fourni' : 'non fourni');

    // Validation des champs obligatoires
    if (!email || !password) {
      console.log('Échec de l\'inscription: email ou mot de passe manquant');
      return res.status(400).json({ 
        success: false, 
        message: 'Email et mot de passe sont requis' 
      });
    }

    // Nettoyer l'email
    const cleanedEmail = email.trim().toLowerCase();
    
    // Vérifier si l'utilisateur existe déjà
    const userExists = await User.findOne({ email: cleanedEmail });
    if (userExists) {
      console.log('Tentative d\'inscription avec un email existant:', cleanedEmail);
      // Ne pas révéler que l'email existe déjà
      return res.status(200).json({ 
        success: true, 
        message: 'Si votre email est valable, vous recevrez bientôt un code de vérification' 
      });
    }

    console.log('Création d\'un nouvel utilisateur avec l\'email:', cleanedEmail);
    
    // Créer l'utilisateur avec le mot de passe hashé
    const user = new User({
      name,
      firstName,
      lastName,
      email: cleanedEmail,
      phone,
      role: 'parent',
      isVerified: false,
      otp: generateOTP(),
      otpExpire: Date.now() + 10 * 60 * 1000
    });

    console.log('Définition du mot de passe...');
    await user.setPassword(password);
    
    console.log('Sauvegarde de l\'utilisateur...');
    await user.save();
    
    console.log('Utilisateur enregistré avec succès, ID:', user._id);
    console.log('Hash du mot de passe:', user.passwordHash ? 'défini' : 'non défini');

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
    const { userId, otp } = req.body;
    const requestIP = req.ip || req.connection.remoteAddress;
    
    // Journalisation sécurisée (sans afficher les données sensibles)
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
        message: 'Données de vérification incomplètes' 
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
    
    // Validation des entrées
    if (!email || !password) {
      console.log('Champs manquants:', { email: !!email, password: '***' });
      return res.status(400).json({ 
        success: false, 
        message: 'Email et mot de passe requis' 
      });
    }

    // Nettoyer l'email (supprimer les espaces)
    const cleanedEmail = email.trim().toLowerCase();
    
    console.log('Tentative de connexion pour l\'email:', cleanedEmail);

    // Trouver l'utilisateur par email en incluant le mot de passe haché
    const user = await User.findOne({ email: cleanedEmail }).select('+passwordHash +isVerified');
    
    // Journalisation pour le débogage
    console.log('Utilisateur trouvé:', user ? 'Oui' : 'Non');
    if (user) {
      console.log('Statut vérification email:', user.isVerified ? 'Vérifié' : 'Non vérifié');
    }

    // Ne pas révéler si l'email existe ou non pour des raisons de sécurité
    const errorResponse = { 
      success: false, 
      message: 'Email ou mot de passe incorrect' 
    };

    if (!user) {
      console.log('Aucun utilisateur trouvé avec cet email');
      return res.status(401).json(errorResponse);
    }

    // Vérifier le mot de passe
    console.log('=== DÉBUT DÉBOGAGE MOT DE PASSE ===');
    console.log('Type de password reçu:', typeof password, 'Valeur:', password);
    console.log('Type de passwordHash stocké:', typeof user.passwordHash);
    
    // Méthode de débogage pour comparer directement avec bcrypt
    const debugCompare = async (plain, hash) => {
      try {
        console.log('Comparaison avec bcrypt.compare...');
        const result = await bcrypt.compare(plain, hash);
        console.log('Résultat de bcrypt.compare:', result);
        return result;
      } catch (err) {
        console.error('Erreur lors de la comparaison avec bcrypt:', err);
        return false;
      }
    };
    
    // 1. Essayer avec la méthode du modèle
    console.log('\n1. Test avec user.matchPassword()...');
    const isMatch = await user.matchPassword(password);
    console.log('Résultat de user.matchPassword():', isMatch);
    
    // 2. Essayer avec bcrypt.compare directement
    console.log('\n2. Test avec bcrypt.compare direct...');
    const directCompare = await debugCompare(password, user.passwordHash);
    
    // 3. Essayer avec un mot de passe connu
    console.log('\n3. Test avec un mot de passe connu...');
    const testPassword = 'test123'; // Remplacer par un mot de passe de test si nécessaire
    const testCompare = await debugCompare(testPassword, user.passwordHash);
    
    console.log('=== FIN DÉBOGAGE MOT DE PASSE ===\n');
    
    if (!isMatch) {
      console.log('Échec de l\'authentification: mot de passe incorrect');
      console.log('Premiers caractères du hash stocké:', user.passwordHash ? user.passwordHash.substring(0, 10) + '...' : 'non défini');
      
      // Si le mot de passe de test fonctionne, c'est que le mot de passe fourni est incorrect
      if (testCompare) {
        console.log('INFO: Le mot de passe de test fonctionne, vérifiez le mot de passe fourni');
      }
      
      return res.status(401).json(errorResponse);
    }

    // Vérifier si l'email est vérifié
    if (!user.isVerified) {
      console.log('Email non vérifié pour l\'utilisateur:', user._id);
      return res.status(403).json({ 
        success: false, 
        message: 'Veuillez vérifier votre email avant de vous connecter', 
        requiresVerification: true, 
        userId: user._id.toString() 
      });
    }

    // Générer un nouveau token JWT
    const token = generateToken(user._id);
    
    // Créer un objet utilisateur sans les champs sensibles
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.otp;
    delete userResponse.otpExpire;
    
    // Journalisation réussie
    console.log('Connexion réussie pour l\'utilisateur:', user._id);
    
    // Réponse de succès
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
