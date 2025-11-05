const mongoose = require('mongoose');

const mairieSchema = new mongoose.Schema({
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
    enum: ['Mairie', 'Mairie d\'Arrondissement', 'Communauté Rurale'],
    default: 'Mairie'
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
  communauteRurale: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CommunauteRurale',
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
  responsable: {
    nom: String,
    prenom: String,
    telephone: String,
    email: String
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index pour les recherches
mairieSchema.index({ region: 1, departement: 1, commune: 1 });
mairieSchema.index({ nom: 1, region: 1 });

module.exports = mongoose.model('Mairie', mairieSchema);

