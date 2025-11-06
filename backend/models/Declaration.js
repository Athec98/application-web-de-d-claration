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
    ref: 'Commune',
    sparse: true
  },
  communauteRurale: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CommunauteRurale',
    sparse: true
  },

  // Informations sur la déclaration
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Hôpital d'accouchement (peut être dans la base ou "autre")
  // Si null, utiliser hopitalAutre
  hopitalAccouchement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hopital',
    required: false
  },
  // Si l'hôpital n'est pas dans la base, stocker les détails ici
  hopitalAutre: {
    nom: String,
    type: String, // 'Hopital', 'Centre de Santé', 'Poste de Santé', 'Clinique', 'Autre'
    adresse: String,
    region: String,
    departement: String,
    telephone: String,
    email: String
  },
  // Hôpital assigné pour vérification (par la mairie)
  hopitalAssigne: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hopital'
  },
  mairie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mairie',
    required: true
  },
  statut: {
    type: String,
    enum: ['en_attente', 'en_cours_mairie', 'en_verification_hopital', 'certificat_valide', 'certificat_rejete', 'validee', 'rejetee', 'archivee'],
    default: 'en_cours_mairie'
  },
  // Référence à l'acte de naissance généré
  acteNaissance: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ActeNaissance',
    sparse: true
  },
  motifRejet: {
    type: String,
    default: ''
  },
  motifRejetHopital: {
    type: String,
    default: ''
  },
  documents: [
    {
      nom: String,
      url: String,
      typeDocument: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  certificatAccouchement: {
    numero: {
      type: String,
      required: true
    },
    dateDelivrance: {
      type: Date,
      required: true
    },
    hopitalDelivrant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hopital'
      // Si l'hôpital est "autre", on utilise hopitalAutre
    },
    fichier: {
      nom: String,
      url: String
    },
    authentique: {
      type: Boolean,
      default: null
    },
    dateVerification: Date,
    verifiePar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  dateDeclaration: {
    type: Date,
    default: Date.now
  },
  dateEnvoiMairie: Date,
  dateEnvoiHopital: Date,
  dateValidation: Date,
  dateRejet: Date,
  numeroActe: String,
  traiteeParMairie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  traiteeParHopital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true // Active createdAt et updatedAt automatiquement
});

// Index pour les recherches fréquentes et vérification des doublons
try {
  declarationSchema.index({ nomEnfant: 1, prenomEnfant: 1, dateNaissance: 1 });
  declarationSchema.index({ user: 1, statut: 1 });
  declarationSchema.index({ region: 1, departement: 1 });
  declarationSchema.index({ statut: 1, dateDeclaration: -1 });
  // Index pour vérification des doublons
  declarationSchema.index({ 
    nomEnfant: 1, 
    prenomEnfant: 1, 
    dateNaissance: 1, 
    nomPere: 1, 
    nomMere: 1 
  });
} catch (error) {
  console.error('Erreur lors de la création de l\'index:', error.message);
}

declarationSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    // Garder _id ET id pour compatibilité
    returnedObject.id = returnedObject._id.toString();
    returnedObject._id = returnedObject._id.toString();
    delete returnedObject.__v;
  }
});

module.exports = mongoose.model('Declaration', declarationSchema);
