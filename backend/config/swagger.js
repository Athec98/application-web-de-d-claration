const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CIVILE-APP API',
      version: '1.0.0',
      description: 'API pour la gestion des déclarations de naissance et des actes de naissance au Sénégal',
      contact: {
        name: 'Support API',
        email: 'support@civile-app.sn'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5000',
        description: 'Serveur de développement'
      },
      {
        url: 'https://api.civile-app.sn',
        description: 'Serveur de production'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Entrez le token JWT obtenu lors de l\'authentification'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'ID unique de l\'utilisateur'
            },
            name: {
              type: 'string',
              description: 'Nom de l\'utilisateur'
            },
            firstName: {
              type: 'string',
              description: 'Prénom de l\'utilisateur'
            },
            lastName: {
              type: 'string',
              description: 'Nom de famille de l\'utilisateur'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email de l\'utilisateur'
            },
            phone: {
              type: 'string',
              description: 'Numéro de téléphone'
            },
            role: {
              type: 'string',
              enum: ['parent', 'mairie', 'hopital', 'admin'],
              description: 'Rôle de l\'utilisateur'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de création'
            }
          }
        },
        Declaration: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'ID unique de la déclaration'
            },
            nomEnfant: {
              type: 'string',
              description: 'Nom de l\'enfant'
            },
            prenomEnfant: {
              type: 'string',
              description: 'Prénom de l\'enfant'
            },
            dateNaissance: {
              type: 'string',
              format: 'date',
              description: 'Date de naissance'
            },
            heureNaissance: {
              type: 'string',
              description: 'Heure de naissance (format HH:mm)'
            },
            lieuNaissance: {
              type: 'string',
              description: 'Lieu de naissance'
            },
            sexe: {
              type: 'string',
              enum: ['M', 'F'],
              description: 'Sexe de l\'enfant'
            },
            poids: {
              type: 'number',
              description: 'Poids à la naissance (en kg)'
            },
            taille: {
              type: 'number',
              description: 'Taille à la naissance (en cm)'
            },
            nomPere: {
              type: 'string',
              description: 'Nom du père'
            },
            prenomPere: {
              type: 'string',
              description: 'Prénom du père'
            },
            nomMere: {
              type: 'string',
              description: 'Nom de la mère'
            },
            prenomMere: {
              type: 'string',
              description: 'Prénom de la mère'
            },
            statut: {
              type: 'string',
              enum: ['en_attente', 'en_cours_mairie', 'en_cours', 'validee', 'rejetee', 'certificat_valide', 'archivee'],
              description: 'Statut de la déclaration'
            },
            documents: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  nom: { type: 'string' },
                  url: { type: 'string' },
                  typeDocument: { type: 'string' }
                }
              }
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        ActeNaissance: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'ID unique de l\'acte'
            },
            declaration: {
              type: 'string',
              description: 'ID de la déclaration associée'
            },
            numeroActe: {
              type: 'string',
              description: 'Numéro de l\'acte de naissance'
            },
            fichierPDF: {
              type: 'string',
              description: 'URL du fichier PDF'
            },
            statutPaiement: {
              type: 'string',
              enum: ['en_attente', 'paye', 'expire'],
              description: 'Statut du paiement'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              description: 'Message d\'erreur'
            },
            error: {
              type: 'string',
              description: 'Détails de l\'erreur (en développement)'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              description: 'Message de succès'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'Routes d\'authentification et de gestion des utilisateurs'
      },
      {
        name: 'Declarations',
        description: 'Routes pour la gestion des déclarations de naissance'
      },
      {
        name: 'Actes de Naissance',
        description: 'Routes pour la gestion des actes de naissance'
      },
      {
        name: 'Géographie',
        description: 'Routes pour récupérer les données géographiques (régions, départements, communes, mairies)'
      },
      {
        name: 'Fichiers',
        description: 'Routes pour la gestion des fichiers uploadés'
      },
      {
        name: 'Notifications',
        description: 'Routes pour la gestion des notifications'
      },
      {
        name: 'Mairie',
        description: 'Routes spécifiques à la mairie'
      }
    ]
  },
  apis: [
    './routes/*.js',
    './controllers/*.js'
  ]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;

