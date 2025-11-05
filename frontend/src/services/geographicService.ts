import api from './api';

export interface Region {
  _id: string;
  code: string;
  nom: string;
  chefLieu?: string;
}

export interface Departement {
  _id: string;
  code: string;
  nom: string;
  region: string | Region;
  chefLieu?: string;
}

export interface Commune {
  _id: string;
  code: string;
  nom: string;
  departement: string | Departement;
  region: string | Region;
}

export interface CommunauteRurale {
  _id: string;
  code: string;
  nom: string;
  departement: string | Departement;
  region: string | Region;
}

export interface Mairie {
  _id: string;
  nom: string;
  code?: string;
  type: string;
  adresse?: string;
  region: string | Region;
  departement: string | Departement;
  commune?: string | Commune;
  telephone?: string;
  email?: string;
}

export interface Hopital {
  _id: string;
  nom: string;
  code?: string;
  type: string;
  adresse?: string;
  region: string | Region;
  departement: string | Departement;
  commune?: string | Commune;
  telephone?: string;
  email?: string;
  delivreCertificatAccouchement: boolean;
}

export const geographicService = {
  // Régions
  async getRegions(): Promise<Region[]> {
    const response = await api.get('/geographic/regions');
    return response.data.regions || [];
  },

  // Départements
  async getDepartementsByRegion(regionId: string): Promise<Departement[]> {
    try {
      const response = await api.get(`/geographic/departements/${regionId}`);
      return response.data?.departements || [];
    } catch (error: any) {
      console.error('Erreur lors du chargement des départements:', error);
      throw error;
    }
  },

  // Communes
  async getCommunesByDepartement(departementId: string): Promise<Commune[]> {
    const response = await api.get(`/geographic/communes/${departementId}`);
    return response.data.communes || [];
  },

  // Communautés rurales
  async getCommunautesRuralesByDepartement(departementId: string): Promise<CommunauteRurale[]> {
    const response = await api.get(`/geographic/communaute-rurales/${departementId}`);
    return response.data.communautesRurales || [];
  },

  // Mairies
  async getMairies(params?: { region?: string; departement?: string; commune?: string }): Promise<Mairie[]> {
    const response = await api.get('/mairies', { params });
    return response.data.mairies || [];
  },

  async getMairiesByRegion(regionId: string): Promise<Mairie[]> {
    const response = await api.get(`/mairies/region/${regionId}`);
    return response.data.mairies || [];
  },

  async getMairiesByDepartement(departementId: string): Promise<Mairie[]> {
    const response = await api.get(`/mairies/departement/${departementId}`);
    return response.data.mairies || [];
  },

  // Hôpitaux
  async getHopitaux(params?: { region?: string; departement?: string; delivreCertificat?: boolean }): Promise<Hopital[]> {
    const response = await api.get('/geographic/hopitaux', { params });
    return response.data.hopitaux || [];
  },
};

