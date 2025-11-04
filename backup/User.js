const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Le prénom est requis'],
    trim: true,
    validate: {
      validator: function(v) {
        return /^[a-zA-ZÀ-ÿ\s'-]+$/.test(v);
      },
      message: 'Le prénom ne doit contenir que des lettres'
    }
  },
  lastName: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true,
    validate: {
      validator: function(v) {
        return /^[a-zA-ZÀ-ÿ\s'-]+$/.test(v);
      },
      message: 'Le nom ne doit contenir que des lettres'
    }
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Email invalide']
  },
  phoneNumber: {
    type: String,
    required: [true, 'Le numéro de téléphone est requis'],
    unique: true,
    validate: {
      validator: function(v) {
        return /^[0-9+\s()-]+$/.test(v);
      },
      message: 'Le numéro de téléphone ne doit contenir que des chiffres'
    }
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: [8, 'Le mot de passe doit contenir au moins 8 caractères']
  },
  role: {
    type: String,
    enum: ['parent', 'mairie', 'hopital'],
    required: true
  },
  address: {
    type: String,
    trim: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  otp: {
    code: String,
    expiresAt: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password avant sauvegarde
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
