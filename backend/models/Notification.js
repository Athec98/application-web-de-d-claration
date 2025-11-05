const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['declaration_nouvelle', 'declaration_validee', 'declaration_rejetee', 'declaration_envoyee_hopital', 'en_verification_hopital', 'certificat_valide', 'certificat_rejete', 'acte_genere', 'autre'],
    required: true
  },
  titre: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  declaration: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Declaration',
    sparse: true
  },
  lu: {
    type: Boolean,
    default: false
  },
  dateLecture: Date
}, {
  timestamps: true
});

// Index pour améliorer les performances
notificationSchema.index({ user: 1, lu: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);

