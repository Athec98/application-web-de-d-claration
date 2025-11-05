import api from './api';

export interface DeclarationData {
  // Enfant
  nomEnfant: string;
  prenomEnfant: string;
  dateNaissance: string;
  heureNaissance?: string;
  lieuNaissance: string;
  sexe: 'M' | 'F';
  poids?: number;
  taille?: number;

  // Parents
  nomPere: string;
  prenomPere?: string;
  professionPere?: string;
  nationalitePere?: string;
  nomMere: string;
  prenomMere?: string;
  nomJeuneFilleMere?: string;
  professionMere?: string;
  nationaliteMere?: string;

  // Géographique
  region: string;
  departement: string;
  commune?: string;
  communauteRurale?: string;

  // Mairie et hôpital
  mairie: string;
  hopitalAccouchement: string | null; // null si "autre"
  hopitalAutre?: {
    nom: string;
    type: string;
    adresse?: string;
    region?: string;
    departement?: string;
    telephone?: string;
    email?: string;
  };

  // Certificat d'accouchement
  certificatAccouchement: {
    numero: string;
    dateDelivrance: string;
  };
}

export interface Declaration extends DeclarationData {
  _id: string;
  user: string | any;
  statut: string;
  dateDeclaration?: string;
  createdAt: string;
  updatedAt: string;
  acteNaissance?: string;
  hopitalAssigne?: string;
  certificatAccouchement: {
    numero: string;
    dateDelivrance: string;
    hopitalDelivrant?: string;
    fichier?: {
      nom?: string;
      url?: string;
    };
    authentique?: boolean;
    dateVerification?: string;
    verifiePar?: string;
    motifRejetHopital?: string;
  };
}

export const declarationService = {
  async createDeclaration(data: DeclarationData): Promise<Declaration> {
    const response = await api.post('/declarations', data);
    return response.data.declaration;
  },

  async getDeclarations(): Promise<Declaration[]> {
    const response = await api.get('/declarations');
    return response.data.declarations || [];
  },

  async getDeclarationById(id: string): Promise<Declaration> {
    const response = await api.get(`/declarations/${id}`);
    return response.data.declaration;
  },

  async getSuggestedHospitals(declarationId: string): Promise<any> {
    const response = await api.get(`/declarations/${declarationId}/suggested-hospitals`);
    return response.data;
  },

  async sendToHospital(declarationId: string, hopitalAssigne: string): Promise<Declaration> {
    const response = await api.put(`/declarations/${declarationId}/send-to-hospital`, {
      hopitalAssigne
    });
    return response.data.declaration;
  },

  async rejectDeclaration(declarationId: string, motifRejet: string): Promise<Declaration> {
    const response = await api.put(`/declarations/${declarationId}/reject`, {
      motifRejet
    });
    return response.data.declaration;
  },

  async validateCertificate(declarationId: string): Promise<Declaration> {
    const response = await api.put(`/declarations/${declarationId}/validate-certificate`);
    return response.data.declaration;
  },

  async rejectCertificate(declarationId: string, motifRejetHopital: string): Promise<Declaration> {
    const response = await api.put(`/declarations/${declarationId}/reject-certificate`, {
      motifRejetHopital
    });
    return response.data.declaration;
  },
};

