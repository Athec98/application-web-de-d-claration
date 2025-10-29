const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  declarationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BirthDeclaration',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    default: 250 // 250 FCFA par téléchargement
  },
  paymentMethod: {
    type: String,
    enum: ['wave', 'orange_money'],
    required: true
  },
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Payment', paymentSchema);
