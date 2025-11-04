const mongoose = require('mongoose');

const declarationSchema = new mongoose.Schema({
  // Informations sur l'enfant
  nomEnfant: {
    type: String,
    required: true,
    trim: true
  },
  prenomEnfant: {
    type: String,
    required: true,
    trim: true
  },
  dateNaissance: {
    type: Date,
    required: true
  },
  heureNaissance: {
    type: String
  },
  lieuNaissance: {
    type: String,
    required: true
  },
  sexe: {
    type: String,
    required: true,
    enum: ['M', 'F']
  },
  poids: Number,
  taille: Number,

  // Informations sur les parents
  nomPere: {
    type: String,
    required: true,
    trim: true
  },
  prenomPere: {
    type: String,
    trim: true
  },
  professionPere: String,
  nationalitePere: String,
  
  nomMere: {
    type: String,
    required: true,
    trim: true
  },
  prenomMere: {
    type: String,
    trim: true
  },
  nomJeuneFilleMere: String,
  professionMere: String,
  nationaliteMere: String,

  // Informations sur la déclaration
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hopital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hopital'
  },
  mairie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mairie'
  },
  statut: {
    type: String,
    enum: ['en_attente', 'validee', 'rejetee'],
    default: 'en_attente'
  },
  motifRejet: {
    type: String,
    default: ''
  },
  documents: [
    {
      nom: String,
      url: String,
      typeDocument: String
    }
  ],
  dateDeclaration: {
    type: Date,
    default: Date.now
  },
  dateValidation: Date,
  numeroActe: String
});

// Index pour les recherches fréquentes
try {
  declarationSchema.index({ nomEnfant: 1, prenomEnfant: 1, dateNaissance: 1 });
} catch (error) {
  console.error('Erreur lors de la création de l\'index:', error.message);
}

declarationSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

module.exports = mongoose.model('Declaration', declarationSchema);
