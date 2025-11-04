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

// Méthode pour définir et hacher le mot de passe
userSchema.methods.setPassword = async function(password) {
  if (password) {
    this.passwordHash = password; // Le hachage sera fait par le pre-save
    return this.save(); // Sauvegarder pour déclencher le pre-save
  }
  return Promise.resolve(this);
};

// Méthode pour vérifier le mot de passe
userSchema.methods.matchPassword = async function(enteredPassword) {
  if (!enteredPassword) {
    console.log('Aucun mot de passe fourni pour la comparaison');
    return false;
  }
  
  if (!this.passwordHash) {
    console.log('Aucun mot de passe hashé trouvé pour cet utilisateur');
    return false;
  }
  
  try {
    console.log('Comparaison des mots de passe...');
    console.log('Type de passwordHash:', typeof this.passwordHash);
    console.log('Longueur de passwordHash:', this.passwordHash.length);
    
    const isMatch = await bcrypt.compare(enteredPassword, this.passwordHash);
    console.log('Résultat de la comparaison:', isMatch);
    
    if (!isMatch) {
      console.log('Le mot de passe fourni ne correspond pas au hash stocké');
      // Pour le débogage, vérifions si le mot de passe est le même que le hash
      const isSameString = enteredPassword === this.passwordHash;
      console.log('Le mot de passe est-il égal au hash?', isSameString);
    }
    
    return isMatch;
  } catch (error) {
    console.error('Erreur lors de la comparaison des mots de passe:', {
      error: error.message,
      stack: error.stack
    });
    return false;
  }
};

// Middleware pour hacher le mot de passe avant de sauvegarder
userSchema.pre('save', async function(next) {
  // Ne hacher le mot de passe que s'il a été modifié
  if (!this.isModified('passwordHash')) {
    return next();
  }
  
  try {
    if (this.passwordHash && !this.passwordHash.startsWith('$2a$')) {
      console.log('Hachage du mot de passe...');
      const salt = await bcrypt.genSalt(10);
      this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
      console.log('Mot de passe haché avec succès');
    }
    next();
  } catch (error) {
    console.error('Erreur lors du hachage du mot de passe:', error);
    next(error);
  }
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
