const mongoose = require('mongoose');

const birthDeclarationSchema = new mongoose.Schema({
  // Référence au parent
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Informations de l'enfant
  childFirstName: {
    type: String,
    required: [true, 'Le prénom de l\'enfant est requis'],
    trim: true,
    validate: {
      validator: function(v) {
        return /^[a-zA-ZÀ-ÿ\s'-]+$/.test(v);
      },
      message: 'Le prénom ne doit contenir que des lettres'
    }
  },
  childLastName: {
    type: String,
    required: [true, 'Le nom de l\'enfant est requis'],
    trim: true,
    validate: {
      validator: function(v) {
        return /^[a-zA-ZÀ-ÿ\s'-]+$/.test(v);
      },
      message: 'Le nom ne doit contenir que des lettres'
    }
  },
  childGender: {
    type: String,
    enum: ['masculin', 'feminin'],
    required: true
  },
  birthDate: {
    type: Date,
    required: [true, 'La date de naissance est requise']
  },
  birthPlace: {
    type: String,
    required: [true, 'Le lieu de naissance est requis'],
    trim: true
  },
  
  // Informations du père
  fatherFirstName: {
    type: String,
    required: [true, 'Le prénom du père est requis'],
    trim: true,
    validate: {
      validator: function(v) {
        return /^[a-zA-ZÀ-ÿ\s'-]+$/.test(v);
      },
      message: 'Le prénom ne doit contenir que des lettres'
    }
  },
  fatherLastName: {
    type: String,
    required: [true, 'Le nom du père est requis'],
    trim: true,
    validate: {
      validator: function(v) {
        return /^[a-zA-ZÀ-ÿ\s'-]+$/.test(v);
      },
      message: 'Le nom ne doit contenir que des lettres'
    }
  },
  fatherIdNumber: {
    type: String,
    required: [true, 'Le numéro d\'identité du père est requis'],
    validate: {
      validator: function(v) {
        return /^[0-9]+$/.test(v);
      },
      message: 'Le numéro d\'identité ne doit contenir que des chiffres'
    }
  },
  
  // Informations de la mère
  motherFirstName: {
    type: String,
    required: [true, 'Le prénom de la mère est requis'],
    trim: true,
    validate: {
      validator: function(v) {
        return /^[a-zA-ZÀ-ÿ\s'-]+$/.test(v);
      },
      message: 'Le prénom ne doit contenir que des lettres'
    }
  },
  motherLastName: {
    type: String,
    required: [true, 'Le nom de la mère est requis'],
    trim: true,
    validate: {
      validator: function(v) {
        return /^[a-zA-ZÀ-ÿ\s'-]+$/.test(v);
      },
      message: 'Le nom ne doit contenir que des lettres'
    }
  },
  motherIdNumber: {
    type: String,
    required: [true, 'Le numéro d\'identité de la mère est requis'],
    validate: {
      validator: function(v) {
        return /^[0-9]+$/.test(v);
      },
      message: 'Le numéro d\'identité ne doit contenir que des chiffres'
    }
  },
  
  // Adresse
  residenceAddress: {
    type: String,
    required: [true, 'L\'adresse de résidence est requise'],
    trim: true
  },
  
  // Documents
  documents: [{
    type: {
      type: String,
      enum: ['certificat_accouchement', 'id_pere', 'id_mere', 'autre'],
      required: true
    },
    filename: String,
    path: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Statut et workflow
  status: {
    type: String,
    enum: ['en_cours', 'en_attente', 'valide', 'rejete'],
    default: 'en_cours'
  },
  rejectionReason: String,
  
  // Vérification hôpital
  hospitalVerification: {
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected']
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date,
    comment: String
  },
  
  // Acte de naissance
  birthCertificate: {
    certificateNumber: String,
    generatedAt: Date,
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    digitalStamp: String,
    digitalSignature: String,
    pdfPath: String
  },
  
  // Dates
  submittedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Mettre à jour updatedAt avant chaque sauvegarde
birthDeclarationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('BirthDeclaration', birthDeclarationSchema);
