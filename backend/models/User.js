const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email requis'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email invalide']
  },
  phone: {
    type: String,
    trim: true
  },
  passwordHash: {
    type: String,
    required: [true, 'Mot de passe requis'],
    select: false
  },
  role: {
    type: String,
    enum: ['parent', 'hopital', 'mairie', 'admin'],
    default: 'parent'
  },
  // Lier l'agent à sa mairie ou hôpital
  mairieAffiliee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mairie',
    sparse: true
  },
  hopitalAffilie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hopital',
    sparse: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  address: {
    type: String,
    trim: true
  },
  otp: {
    type: String,
    select: false
  },
  otpExpire: {
    type: Date,
    select: false
  },
  loginAttempts: {
    type: Number,
    default: 0,
    select: false
  },
  lockUntil: {
    type: Date,
    select: false
  },
  resetPasswordToken: {
    type: String,
    select: false
  },
  resetPasswordExpire: {
    type: Date,
    select: false
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret.passwordHash;
      delete ret.otp;
      delete ret.otpExpire;
      delete ret.__v;
      delete ret.loginAttempts;
      delete ret.lockUntil;
      delete ret.resetPasswordToken;
      delete ret.resetPasswordExpire;
      return ret;
    }
  }
});

// L'index unique pour email est déjà défini dans la définition du champ

// Vérifier si le compte est verrouillé
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Méthode pour définir le mot de passe
userSchema.methods.setPassword = async function(password) {
  if (!password || password.length < 6) {
    throw new Error('Le mot de passe doit contenir au moins 6 caractères');
  }
  
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(password, salt);
  return this;
};

// Méthode pour vérifier le mot de passe
userSchema.methods.matchPassword = async function(enteredPassword) {
  if (!enteredPassword || !this.passwordHash) {
    return false;
  }
  
  try {
    return await bcrypt.compare(enteredPassword, this.passwordHash);
  } catch (error) {
    console.error('Erreur comparaison mot de passe:', error.message);
    return false;
  }
};

// Gérer les tentatives de connexion
userSchema.methods.incLoginAttempts = async function() {
  // Si le verrouillage a expiré, réinitialiser
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  const maxAttempts = 5;
  const lockTime = 2 * 60 * 60 * 1000; // 2 heures
  
  // Verrouiller après 5 tentatives
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + lockTime };
  }
  
  return this.updateOne(updates);
};

// Réinitialiser les tentatives après connexion réussie
userSchema.methods.resetLoginAttempts = async function() {
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 }
  });
};

// Middleware pour hacher le mot de passe avant de sauvegarder
userSchema.pre('save', async function(next) {
  // Ne hacher le mot de passe que s'il a été modifié
  if (!this.isModified('passwordHash') || !this.passwordHash) {
    return next();
  }
  
  // Si le mot de passe est déjà haché, ne rien faire
  if (this.passwordHash.startsWith('$2a$')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    console.error('Erreur lors du hachage du mot de passe:', error);
    next(error);
  }
});

// Méthode pour obtenir le nom complet
userSchema.virtual('fullName').get(function() {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`.trim();
  }
  return this.name || '';
});

// Générer un token de réinitialisation de mot de passe
userSchema.methods.getResetPasswordToken = function() {
  // Générer un token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hasher le token et le stocker
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Définir une date d'expiration (30 minutes)
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model('User', userSchema, 'users');
