import api from './api';

const declarationService = {
  // Créer une déclaration
  createDeclaration: async (formData) => {
    const response = await api.post('/declarations', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Obtenir mes déclarations (Parent)
  getMyDeclarations: async () => {
    const response = await api.get('/declarations/my-declarations');
    return response.data;
  },

  // Obtenir une déclaration par ID
  getDeclarationById: async (id) => {
    const response = await api.get(`/declarations/${id}`);
    return response.data;
  },

  // Mettre à jour une déclaration
  updateDeclaration: async (id, formData) => {
    const response = await api.put(`/declarations/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Obtenir toutes les déclarations (Mairie)
  getAllDeclarations: async () => {
    const response = await api.get('/declarations/mairie/all');
    return response.data;
  },

  // Envoyer à l'hôpital
  sendToHospital: async (id) => {
    const response = await api.put(`/declarations/${id}/send-to-hospital`);
    return response.data;
  },

  // Rejeter une déclaration
  rejectDeclaration: async (id, rejectionReason) => {
    const response = await api.put(`/declarations/${id}/reject`, { rejectionReason });
    return response.data;
  },

  // Obtenir les demandes de vérification (Hôpital)
  getVerificationRequests: async () => {
    const response = await api.get('/declarations/hopital/verifications');
    return response.data;
  },

  // Vérifier un certificat
  verifyCertificate: async (id, isValid, comment) => {
    const response = await api.put(`/declarations/${id}/verify`, { isValid, comment });
    return response.data;
  },

  // Générer l'acte de naissance
  generateBirthCertificate: async (id, digitalStamp, digitalSignature) => {
    const response = await api.put(`/declarations/${id}/generate-certificate`, {
      digitalStamp,
      digitalSignature,
    });
    return response.data;
  },
};

export default declarationService;
