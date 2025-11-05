const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  // Récupérer le token du header
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // Format: Bearer <token>
    token = req.headers.authorization.split(' ')[1];
  } else if (req.header('x-auth-token')) {
    // Support pour l'ancienne méthode
    token = req.header('x-auth-token');
  }

  // Vérifier si le token n'existe pas
  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'Accès refusé. Aucun token fourni.'
    });
  }

  try {
    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Vérifier si l'utilisateur existe toujours dans la base de données
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Le token est valide mais l\'utilisateur n\'existe plus.'
      });
    }
    
    // Vérifier si l'utilisateur est vérifié
    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: 'Veuillez vérifier votre email avant de continuer.',
        requiresVerification: true,
        userId: user._id
      });
    }
    
    // Ajouter l'utilisateur à la requête
    req.user = user;
    next();
  } catch (err) {
    console.error('Erreur de vérification du token:', err);
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token invalide.'
      });
    }
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'La session a expiré. Veuillez vous reconnecter.'
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Erreur d\'authentification.'
    });
  }
};

// Middleware pour vérifier le rôle d'administrateur
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ msg: 'Accès non autorisé' });
  }
};

// Middleware pour vérifier les rôles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé - utilisateur non authentifié'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Le rôle ${req.user.role} n'est pas autorisé à accéder à cette ressource`
      });
    }

    next();
  };
};

module.exports = { auth, admin, authorize };
