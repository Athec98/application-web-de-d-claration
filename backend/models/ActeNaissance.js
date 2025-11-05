const mongoose = require('mongoose');

const acteNaissanceSchema = new mongoose.Schema({
  declaration: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Declaration',
    required: true,
    unique: true
  },
  numeroRegistre: {
    type: String,
    required: true,
    unique: true
  },
  annee: {
    type: Number,
    required: true
  },
  numeroActe: {
    type: String,
    required: true,
    unique: true
  },
  // Informations de l'enfant
  nomEnfant: {
    type: String,
    required: true
  },
  prenomEnfant: {
    type: String,
    required: true
  },
  dateNaissance: {
    type: Date,
    required: true
  },
  heureNaissance: String,
  lieuNaissance: String,
  sexe: {
    type: String,
    enum: ['M', 'F'],
    required: true
  },
  // Informations des parents
  nomPere: String,
  prenomPere: String,
  professionPere: String,
  nationalitePere: String,
  nomMere: String,
  prenomMere: String,
  nomJeuneFilleMere: String,
  professionMere: String,
  nationaliteMere: String,
  // Informations géographiques
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
    ref: 'Commune'
  },
  mairie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mairie',
    required: true
  },
  // Fichier PDF généré
  fichierPDF: {
    nom: String,
    url: String,
    chemin: String,
    taille: Number,
    dateGeneration: {
      type: Date,
      default: Date.now
    }
  },
  // Timbre et cachet numérique
  timbre: {
    type: String,
    required: true
  },
  cachetNumerique: {
    type: String,
    required: true
  },
  // Informations de paiement et téléchargement
  prixUnitaire: {
    type: Number,
    default: 250, // 250 FCFA par acte
    required: true
  },
  telechargements: [{
    dateTelechargement: {
      type: Date,
      default: Date.now
    },
    nombreActes: {
      type: Number,
      required: true
    },
    montant: {
      type: Number,
      required: true
    },
    modePaiement: {
      type: String,
      enum: ['wave', 'orange_money', 'banque', 'autre']
    },
    referencePaiement: String,
    statutPaiement: {
      type: String,
      enum: ['en_attente', 'paye', 'annule'],
      default: 'en_attente'
    },
    fichierTelecharge: {
      nom: String,
      url: String
    }
  }],
  // Statistiques
  nombreTotalTelechargements: {
    type: Number,
    default: 0
  },
  montantTotalCollecte: {
    type: Number,
    default: 0
  },
  // Archivage
  archive: {
    type: Boolean,
    default: false
  },
  dateArchivage: Date,
  // Créé par
  generePar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index pour recherches fréquentes
acteNaissanceSchema.index({ numeroRegistre: 1, annee: 1 });
acteNaissanceSchema.index({ declaration: 1 });
acteNaissanceSchema.index({ numeroActe: 1 });

module.exports = mongoose.model('ActeNaissance', acteNaissanceSchema);

