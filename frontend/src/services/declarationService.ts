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

export interface Declaration extends Omit<DeclarationData, 'region' | 'departement' | 'commune' | 'mairie' | 'hopitalAccouchement' | 'hopitalAutre'> {
  _id: string;
  user: string | any;
  statut: string;
  dateDeclaration?: string;
  createdAt: string;
  updatedAt: string;
  acteNaissance?: string | any;
  hopitalAssigne?: string;
  dateEnvoiMairie?: string;
  dateEnvoiHopital?: string;
  dateValidation?: string;
  motifRejet?: string;
  region?: string | any;
  departement?: string | any;
  commune?: string | any;
  mairie?: string | any;
  hopitalAccouchement?: string | any;
  hopitalAutre?: {
    nom?: string;
    type?: string;
    adresse?: string;
    telephone?: string;
    email?: string;
  };
  documents?: Array<{
    nom: string;
    url?: string;
    typeDocument?: string;
  }>;
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

  async createDeclarationWithFiles(formData: FormData): Promise<Declaration> {
    // Ne pas définir Content-Type manuellement - axios le fera automatiquement pour FormData
    const response = await api.post('/declarations', formData);
    return response.data.declaration;
  },

  async updateDeclaration(id: string, formData: FormData): Promise<Declaration> {
    // Ne pas définir Content-Type manuellement - axios le fera automatiquement pour FormData
    const response = await api.put(`/declarations/${id}`, formData);
    return response.data.declaration;
  },

  async getDeclarations(): Promise<Declaration[]> {
    const response = await api.get('/declarations');
    console.log('Réponse API getDeclarations:', response.data);
    // Le backend peut retourner response.data.declarations ou response.data.data
    const declarations = response.data.declarations || response.data.data || [];
    console.log('Déclarations extraites:', declarations);
    return declarations;
  },

  async getMyDeclarations(): Promise<Declaration[]> {
    const response = await api.get('/declarations/my-declarations');
    console.log('Réponse API getMyDeclarations complète:', response);
    console.log('Response.data:', response.data);
    // Le backend retourne { success: true, count: ..., data: [...] }
    const declarations = response.data.data || response.data.declarations || [];
    console.log('Déclarations brutes:', declarations);
    
    // Normaliser les IDs - MongoDB peut retourner _id comme objet ou id comme string
    const normalized = declarations.map((d: any) => {
      // Si l'objet a un id mais pas de _id, utiliser id comme _id
      if (d.id && !d._id) {
        console.log('Normalisation: id -> _id pour', d.id);
        return { ...d, _id: d.id };
      }
      // Si l'_id est un objet (ObjectId MongoDB), le convertir en string
      if (d._id && typeof d._id === 'object' && d._id.toString) {
        console.log('Normalisation: _id objet -> string', d._id);
        return { ...d, _id: d._id.toString() };
      }
      // Si _id existe déjà comme string, garder tel quel
      if (d._id && typeof d._id === 'string') {
        return d;
      }
      // Cas où ni _id ni id n'existent
      console.warn('Déclaration sans _id ni id:', d);
      console.warn('Clés disponibles:', Object.keys(d));
      return d;
    });
    
    console.log('Déclarations normalisées:', normalized);
    return normalized;
  },

  async getDeclarationById(id: string): Promise<Declaration> {
    // Normaliser l'ID (peut être string ou objet)
    const idValue: any = id;
    const normalizedId = typeof idValue === 'string' 
      ? idValue 
      : (idValue && typeof idValue === 'object' && idValue !== null 
        ? (idValue._id || idValue.id || String(idValue)) 
        : String(idValue));
    
    if (!normalizedId || normalizedId === 'undefined' || normalizedId === '[object Object]' || normalizedId === 'null') {
      console.error('ID de déclaration invalide reçu:', id);
      throw new Error('ID de déclaration invalide');
    }
    
    const response = await api.get(`/declarations/${normalizedId}`);
    // Le backend peut retourner response.data.declaration ou response.data.data
    return response.data.declaration || response.data.data;
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

  async validateDeclaration(declarationId: string): Promise<Declaration> {
    const response = await api.put(`/declarations/${declarationId}/validate`);
    return response.data.declaration || response.data.data;
  },

  async rejectDeclaration(declarationId: string, motifRejet: string): Promise<Declaration> {
    const response = await api.put(`/declarations/${declarationId}/reject`, {
      motifRejet
    });
    return response.data.declaration || response.data.data;
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

  async archiveDeclaration(declarationId: string): Promise<Declaration> {
    const response = await api.put(`/declarations/${declarationId}/archive`);
    return response.data.declaration;
  },

  // Services pour l'hôpital
  async getVerificationRequests(): Promise<Declaration[]> {
    const response = await api.get('/declarations/hopital/verifications');
    return response.data.data || [];
  },

  async getAllHospitalDeclarations(): Promise<Declaration[]> {
    const response = await api.get('/declarations/hopital/all');
    return response.data.data || response.data.declarations || [];
  },

  async verifyCertificate(declarationId: string, isValid: boolean, comment?: string): Promise<Declaration> {
    // Utiliser la route appropriée selon isValid
    const route = isValid 
      ? `/declarations/${declarationId}/validate-certificate`
      : `/declarations/${declarationId}/reject-certificate`;
    
    const body = isValid 
      ? { comment }
      : { motifRejetHopital: comment || 'Certificat non conforme' };
    
    const response = await api.put(route, body);
    return response.data.declaration || response.data.data;
  },
};

