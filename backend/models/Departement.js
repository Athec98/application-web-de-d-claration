const mongoose = require('mongoose');

const departementSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  nom: {
    type: String,
    required: true,
    trim: true
  },
  region: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Region',
    required: true
  },
  chefLieu: {
    type: String,
    trim: true
  },
  communes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Commune'
  }],
  communautesRurales: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CommunauteRurale'
  }],
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Departement', departementSchema);

