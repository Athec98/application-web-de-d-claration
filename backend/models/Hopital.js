const mongoose = require('mongoose');

const hopitalSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    unique: true,
    trim: true,
    sparse: true
  },
  type: {
    type: String,
    enum: ['Hopital', 'Centre de Santé', 'Poste de Santé', 'Clinique', 'Autre'],
    default: 'Hopital'
  },
  adresse: {
    type: String,
    trim: true
  },
  region: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Region',
    required: true
  },
  departement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Departement',
    required: true
  },
  commune: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Commune',
    sparse: true
  },
  telephone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  delivreCertificatAccouchement: {
    type: Boolean,
    default: true
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Hopital', hopitalSchema);

