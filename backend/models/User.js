const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
    required: [true, 'Veuillez ajouter un email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Veuillez ajouter un email valide'
    ]
  },
  phone: {
    type: String,
    trim: true
  },
  passwordHash: {
    type: String,
    select: false
  },
  role: {
    type: String,
    enum: ['parent', 'hopital', 'mairie', 'admin'],
    default: 'parent'
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
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true
});

// Méthode pour définir le mot de passe (hachage automatique)
userSchema.methods.setPassword = async function(password) {
  if (password) {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(password, salt);
  }
};

// Méthode pour vérifier le mot de passe
userSchema.methods.matchPassword = async function(enteredPassword) {
  if (!enteredPassword || !this.passwordHash) {
    return false;
  }
  
  try {
    return await bcrypt.compare(enteredPassword, this.passwordHash);
  } catch (error) {
    console.error('Erreur lors de la comparaison des mots de passe:', error);
    return false;
  }
};

// Middleware pour hacher le mot de passe avant de sauvegarder
userSchema.pre('save', async function(next) {
  // Ne pas hacher le mot de passe s'il n'a pas été modifié
  if (!this.isModified('passwordHash')) {
    return next();
  }
  
  // Si le mot de passe est modifié, le hacher
  if (this.password) {
    await this.setPassword(this.password);
    // Ne pas conserver le mot de passe en clair
    this.password = undefined;
  }
  
  next();
});

// Méthode pour obtenir le nom complet
userSchema.virtual('fullName').get(function() {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.name || '';
});

// S'assurer que les champs virtuels sont inclus dans les réponses JSON
userSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema, 'users');
