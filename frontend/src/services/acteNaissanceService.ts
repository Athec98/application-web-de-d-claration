import api from './api';

export interface ActeNaissance {
  _id: string;
  declaration: string;
  numeroRegistre: string;
  annee: number;
  numeroActe: string;
  nomEnfant: string;
  prenomEnfant: string;
  dateNaissance: string;
  heureNaissance?: string;
  lieuNaissance: string;
  sexe: 'M' | 'F';
  nomPere?: string;
  prenomPere?: string;
  professionPere?: string;
  nationalitePere?: string;
  nomMere?: string;
  prenomMere?: string;
  nomJeuneFilleMere?: string;
  professionMere?: string;
  nationaliteMere?: string;
  region: any;
  departement: any;
  commune?: any;
  mairie: any;
  timbre: string;
  cachetNumerique: string;
  prixUnitaire: number;
  fichierPDF: {
    nom: string;
    url: string;
    chemin: string;
    taille: number;
    dateGeneration: string;
  };
  telechargements: any[];
  nombreTotalTelechargements: number;
  montantTotalCollecte: number;
  archive: boolean;
  generePar: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentData {
  nombreActes: number;
  montant: number;
  prixUnitaire: number;
  modePaiement?: string;
  referencePaiement: string;
  statutPaiement: string;
  paymentUrl: string;
}

export const acteNaissanceService = {
  async generateActeNaissance(declarationId: string): Promise<ActeNaissance> {
    const response = await api.post(`/actes-naissance/generate/${declarationId}`);
    return response.data.acteNaissance;
  },

  async getActeNaissance(id: string): Promise<ActeNaissance> {
    const response = await api.get(`/actes-naissance/${id}`);
    return response.data.acteNaissance;
  },

  async initiatePayment(acteId: string, nombreActes: number, modePaiement?: string): Promise<PaymentData> {
    const response = await api.post(`/actes-naissance/${acteId}/payment`, {
      nombreActes,
      modePaiement
    });
    return response.data.telechargement;
  },

  async confirmPaymentAndDownload(reference: string): Promise<Blob> {
    const response = await api.post(`/actes-naissance/payment/confirm/${reference}`, {}, {
      responseType: 'blob'
    });
    return response.data;
  },

  async downloadActeNaissance(acteId: string, ref?: string): Promise<Blob> {
    const params = ref ? { ref } : {};
    const response = await api.get(`/actes-naissance/download/${acteId}`, {
      params,
      responseType: 'blob'
    });
    return response.data;
  },
};

