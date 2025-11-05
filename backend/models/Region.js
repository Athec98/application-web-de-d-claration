const mongoose = require('mongoose');

const regionSchema = new mongoose.Schema({
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
  chefLieu: {
    type: String,
    trim: true
  },
  departements: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Departement'
  }],
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Region', regionSchema);

