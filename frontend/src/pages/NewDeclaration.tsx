import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { geographicService, type Region, type Departement, type Commune, type Mairie, type Hopital } from "@/services/geographicService";
import { declarationService, type DeclarationData } from "@/services/declarationService";

export default function NewDeclaration() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  // Données géographiques
  const [regions, setRegions] = useState<Region[]>([]);
  const [departements, setDepartements] = useState<Departement[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [mairies, setMairies] = useState<Mairie[]>([]);
  const [hopitaux, setHopitaux] = useState<Hopital[]>([]);

  // Sélections
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedDepartement, setSelectedDepartement] = useState<string>("");
  const [selectedCommune, setSelectedCommune] = useState<string>("");
  const [selectedMairie, setSelectedMairie] = useState<string>("");
  const [selectedHopital, setSelectedHopital] = useState<string>("autre");
  const [showHopitalAutre, setShowHopitalAutre] = useState(false);

  const [formData, setFormData] = useState({
    // Informations enfant
    nomEnfant: "",
    prenomEnfant: "",
    sexe: "" as "M" | "F" | "",
    dateNaissance: "",
    heureNaissance: "",
    lieuNaissance: "",
    poids: "",
    taille: "",
    
    // Informations père
    nomPere: "",
    prenomPere: "",
    professionPere: "",
    nationalitePere: "",
    
    // Informations mère
    nomMere: "",
    prenomMere: "",
    nomJeuneFilleMere: "",
    professionMere: "",
    nationaliteMere: "",
    
    // Hôpital autre
    hopitalAutreNom: "",
    hopitalAutreType: "",
    hopitalAutreAdresse: "",
    hopitalAutreTelephone: "",
    hopitalAutreEmail: "",

    // Certificat d'accouchement
    certificatNumero: "",
    certificatDateDelivrance: "",
  });

  const [documents, setDocuments] = useState({
    certificatAccouchement: null as File | null,
    idPere: null as File | null,
    idMere: null as File | null,
    autres: null as File | null,
  });

  // Charger les régions au montage
  useEffect(() => {
    loadRegions();
  }, []);

  // Charger les départements quand une région est sélectionnée
  useEffect(() => {
    if (selectedRegion) {
      loadDepartements(selectedRegion);
      setSelectedDepartement("");
      setSelectedCommune("");
      setSelectedMairie("");
      setMairies([]);
      setCommunes([]);
    }
  }, [selectedRegion]);

  // Charger les communes et mairies quand un département est sélectionné
  useEffect(() => {
    if (selectedDepartement) {
      loadCommunes(selectedDepartement);
      loadMairies(selectedDepartement);
      setSelectedCommune("");
      setSelectedMairie("");
    }
  }, [selectedDepartement]);

  // Charger les hôpitaux quand une région est sélectionnée
  useEffect(() => {
    if (selectedRegion) {
      loadHopitaux(selectedRegion);
    }
  }, [selectedRegion]);

  const loadRegions = async () => {
    try {
      setLoadingData(true);
      const data = await geographicService.getRegions();
      setRegions(data);
    } catch (error: any) {
      toast.error("Erreur lors du chargement des régions");
      console.error(error);
    } finally {
      setLoadingData(false);
    }
  };

  const loadDepartements = async (regionId: string) => {
    try {
      setLoadingData(true);
      const data = await geographicService.getDepartementsByRegion(regionId);
      setDepartements(data);
      if (data.length === 0) {
        toast.info("Aucun département trouvé pour cette région");
      }
    } catch (error: any) {
      console.error("Erreur lors du chargement des départements:", error);
      const errorMessage = error.response?.data?.message || error.message || "Erreur lors du chargement des départements";
      toast.error(errorMessage);
      setDepartements([]);
    } finally {
      setLoadingData(false);
    }
  };

  const loadCommunes = async (departementId: string) => {
    try {
      setLoadingData(true);
      const data = await geographicService.getCommunesByDepartement(departementId);
      setCommunes(data);
      if (data.length === 0) {
        console.log("Aucune commune trouvée pour ce département");
      } else {
        console.log(`${data.length} commune(s) trouvée(s)`);
      }
    } catch (error: any) {
      console.error("Erreur lors du chargement des communes:", error);
      const errorMessage = error.response?.data?.message || error.message || "Erreur lors du chargement des communes";
      toast.error(errorMessage);
      setCommunes([]);
    } finally {
      setLoadingData(false);
    }
  };

  const loadMairies = async (departementId: string) => {
    try {
      setLoadingData(true);
      const data = await geographicService.getMairiesByDepartement(departementId);
      setMairies(data);
      if (data.length === 0) {
        console.log("Aucune mairie trouvée pour ce département");
        toast.info("Aucune mairie trouvée pour ce département. Veuillez contacter l'administrateur.");
      } else {
        console.log(`${data.length} mairie(s) trouvée(s)`);
      }
    } catch (error: any) {
      console.error("Erreur lors du chargement des mairies:", error);
      const errorMessage = error.response?.data?.message || error.message || "Erreur lors du chargement des mairies";
      toast.error(errorMessage);
      setMairies([]);
    } finally {
      setLoadingData(false);
    }
  };

  const loadHopitaux = async (regionId: string) => {
    try {
      const data = await geographicService.getHopitaux({ 
        region: regionId, 
        delivreCertificat: true 
      });
      setHopitaux(data);
    } catch (error: any) {
      console.error("Erreur lors du chargement des hôpitaux", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof typeof documents) => {
    if (e.target.files && e.target.files[0]) {
      setDocuments({
        ...documents,
        [field]: e.target.files[0],
      });
    }
  };

  const handleHopitalChange = (value: string) => {
    setSelectedHopital(value);
    setShowHopitalAutre(value === "autre");
    if (value !== "autre") {
      // Réinitialiser les champs hôpital autre
      setFormData({
        ...formData,
        hopitalAutreNom: "",
        hopitalAutreType: "",
        hopitalAutreAdresse: "",
        hopitalAutreTelephone: "",
        hopitalAutreEmail: "",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations
    if (!selectedRegion || !selectedDepartement || !selectedMairie) {
      toast.error("Veuillez sélectionner la région, le département et la mairie");
      return;
    }

    if (!selectedHopital || (selectedHopital === "autre" && !formData.hopitalAutreNom)) {
      toast.error("Veuillez sélectionner ou renseigner l'hôpital d'accouchement");
      return;
    }

    if (!formData.certificatNumero || !formData.certificatDateDelivrance) {
      toast.error("Veuillez renseigner les informations du certificat d'accouchement");
      return;
    }

    if (!documents.certificatAccouchement) {
      toast.error("Veuillez téléverser le certificat d'accouchement");
      return;
    }

    setLoading(true);

    try {
      // Préparer les données de déclaration
      const declarationData: DeclarationData = {
        nomEnfant: formData.nomEnfant,
        prenomEnfant: formData.prenomEnfant,
        sexe: formData.sexe as "M" | "F",
        dateNaissance: formData.dateNaissance,
        heureNaissance: formData.heureNaissance || undefined,
        lieuNaissance: formData.lieuNaissance,
        poids: formData.poids ? parseFloat(formData.poids) : undefined,
        taille: formData.taille ? parseFloat(formData.taille) : undefined,
        nomPere: formData.nomPere,
        prenomPere: formData.prenomPere || undefined,
        professionPere: formData.professionPere || undefined,
        nationalitePere: formData.nationalitePere || undefined,
        nomMere: formData.nomMere,
        prenomMere: formData.prenomMere || undefined,
        nomJeuneFilleMere: formData.nomJeuneFilleMere || undefined,
        professionMere: formData.professionMere || undefined,
        nationaliteMere: formData.nationaliteMere || undefined,
        region: selectedRegion,
        departement: selectedDepartement,
        commune: selectedCommune || undefined,
        mairie: selectedMairie,
        hopitalAccouchement: selectedHopital === "autre" ? null : selectedHopital,
        hopitalAutre: selectedHopital === "autre" ? {
          nom: formData.hopitalAutreNom,
          type: formData.hopitalAutreType,
          adresse: formData.hopitalAutreAdresse || undefined,
          telephone: formData.hopitalAutreTelephone || undefined,
          email: formData.hopitalAutreEmail || undefined,
        } : undefined,
        certificatAccouchement: {
          numero: formData.certificatNumero,
          dateDelivrance: formData.certificatDateDelivrance,
        },
      };

      await declarationService.createDeclaration(declarationData);
      
      toast.success("Déclaration soumise avec succès !");
      window.location.href = "/dashboard";
    } catch (error: any) {
      console.error("Erreur lors de la soumission:", error);
      toast.error(error.response?.data?.message || "Erreur lors de la soumission");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => {
                window.location.href = "/dashboard";
              }}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-senegal-green-dark">
                Nouvelle Déclaration de Naissance
              </h1>
              <p className="text-sm text-gray-600">
                Remplissez tous les champs obligatoires
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Informations géographiques et mairie */}
          <Card>
            <CardHeader>
              <CardTitle>1. Localisation et Mairie</CardTitle>
              <CardDescription>
                Sélectionnez votre région, département, commune et la mairie pour votre déclaration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="region">Région *</Label>
                  <Select 
                    value={selectedRegion}
                    onValueChange={setSelectedRegion}
                    disabled={loadingData}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingData ? "Chargement..." : "Sélectionner la région"} />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((region) => (
                        <SelectItem key={region._id} value={region._id}>
                          {region.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="departement">Département *</Label>
                  <Select 
                    value={selectedDepartement}
                    onValueChange={setSelectedDepartement}
                    disabled={!selectedRegion || loadingData}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={!selectedRegion ? "Sélectionnez d'abord une région" : loadingData ? "Chargement..." : "Sélectionner le département"} />
                    </SelectTrigger>
                    <SelectContent>
                      {departements.map((dept) => (
                        <SelectItem key={dept._id} value={dept._id}>
                          {dept.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="commune">Commune (optionnel)</Label>
                  <Select 
                    value={selectedCommune}
                    onValueChange={setSelectedCommune}
                    disabled={!selectedDepartement || loadingData}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={!selectedDepartement ? "Sélectionnez d'abord un département" : loadingData ? "Chargement..." : "Sélectionner la commune"} />
                    </SelectTrigger>
                    <SelectContent>
                      {communes.map((commune) => (
                        <SelectItem key={commune._id} value={commune._id}>
                          {commune.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mairie">Mairie *</Label>
                  <Select 
                    value={selectedMairie}
                    onValueChange={setSelectedMairie}
                    disabled={!selectedDepartement || loadingData}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={!selectedDepartement ? "Sélectionnez d'abord un département" : loadingData ? "Chargement..." : "Sélectionner la mairie"} />
                    </SelectTrigger>
                    <SelectContent>
                      {mairies.map((mairie) => (
                        <SelectItem key={mairie._id} value={mairie._id}>
                          {mairie.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Informations de l'enfant */}
          <Card>
            <CardHeader>
              <CardTitle>2. Informations sur l'Enfant</CardTitle>
              <CardDescription>
                Renseignez les informations de l'enfant né
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prenomEnfant">Prénom(s) *</Label>
                  <Input
                    id="prenomEnfant"
                    name="prenomEnfant"
                    value={formData.prenomEnfant}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nomEnfant">Nom *</Label>
                  <Input
                    id="nomEnfant"
                    name="nomEnfant"
                    value={formData.nomEnfant}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sexe">Sexe *</Label>
                  <Select 
                    value={formData.sexe}
                    onValueChange={(value) => setFormData({ ...formData, sexe: value as "M" | "F" })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculin</SelectItem>
                      <SelectItem value="F">Féminin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateNaissance">Date de naissance *</Label>
                  <Input
                    id="dateNaissance"
                    name="dateNaissance"
                    type="date"
                    value={formData.dateNaissance}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="heureNaissance">Heure de naissance</Label>
                  <Input
                    id="heureNaissance"
                    name="heureNaissance"
                    type="time"
                    value={formData.heureNaissance}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lieuNaissance">Lieu de naissance *</Label>
                  <Input
                    id="lieuNaissance"
                    name="lieuNaissance"
                    value={formData.lieuNaissance}
                    onChange={handleChange}
                    placeholder="Ex: Hôpital Principal de Dakar"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="poids">Poids (kg)</Label>
                  <Input
                    id="poids"
                    name="poids"
                    type="number"
                    step="0.1"
                    value={formData.poids}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taille">Taille (cm)</Label>
                  <Input
                    id="taille"
                    name="taille"
                    type="number"
                    step="0.1"
                    value={formData.taille}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Informations des parents */}
          <Card>
            <CardHeader>
              <CardTitle>3. Informations sur les Parents</CardTitle>
              <CardDescription>
                Renseignez les informations du père et de la mère
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Père */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Père</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prenomPere">Prénom(s)</Label>
                    <Input
                      id="prenomPere"
                      name="prenomPere"
                      value={formData.prenomPere}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nomPere">Nom *</Label>
                    <Input
                      id="nomPere"
                      name="nomPere"
                      value={formData.nomPere}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="professionPere">Profession</Label>
                    <Input
                      id="professionPere"
                      name="professionPere"
                      value={formData.professionPere}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nationalitePere">Nationalité</Label>
                    <Input
                      id="nationalitePere"
                      name="nationalitePere"
                      value={formData.nationalitePere}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Mère */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Mère</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prenomMere">Prénom(s)</Label>
                    <Input
                      id="prenomMere"
                      name="prenomMere"
                      value={formData.prenomMere}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nomMere">Nom *</Label>
                    <Input
                      id="nomMere"
                      name="nomMere"
                      value={formData.nomMere}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nomJeuneFilleMere">Nom de jeune fille</Label>
                    <Input
                      id="nomJeuneFilleMere"
                      name="nomJeuneFilleMere"
                      value={formData.nomJeuneFilleMere}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="professionMere">Profession</Label>
                    <Input
                      id="professionMere"
                      name="professionMere"
                      value={formData.professionMere}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationaliteMere">Nationalité</Label>
                  <Input
                    id="nationaliteMere"
                    name="nationaliteMere"
                    value={formData.nationaliteMere}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Hôpital d'accouchement */}
          <Card>
            <CardHeader>
              <CardTitle>4. Hôpital d'Accouchement</CardTitle>
              <CardDescription>
                Sélectionnez l'hôpital où l'accouchement a eu lieu
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hopital">Hôpital d'accouchement *</Label>
                <Select 
                  value={selectedHopital}
                  onValueChange={handleHopitalChange}
                  disabled={!selectedRegion}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={!selectedRegion ? "Sélectionnez d'abord une région" : "Sélectionner l'hôpital"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="autre">Autre (hôpital non listé)</SelectItem>
                    {hopitaux.map((hopital) => (
                      <SelectItem key={hopital._id} value={hopital._id}>
                        {hopital.nom} ({hopital.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {showHopitalAutre && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
                  <h4 className="font-semibold">Informations de l'hôpital</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hopitalAutreNom">Nom de l'hôpital *</Label>
                      <Input
                        id="hopitalAutreNom"
                        name="hopitalAutreNom"
                        value={formData.hopitalAutreNom}
                        onChange={handleChange}
                        required={showHopitalAutre}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hopitalAutreType">Type *</Label>
                      <Select 
                        value={formData.hopitalAutreType}
                        onValueChange={(value) => setFormData({ ...formData, hopitalAutreType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Hopital">Hôpital</SelectItem>
                          <SelectItem value="Centre de Santé">Centre de Santé</SelectItem>
                          <SelectItem value="Poste de Santé">Poste de Santé</SelectItem>
                          <SelectItem value="Clinique">Clinique</SelectItem>
                          <SelectItem value="Autre">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hopitalAutreAdresse">Adresse</Label>
                    <Input
                      id="hopitalAutreAdresse"
                      name="hopitalAutreAdresse"
                      value={formData.hopitalAutreAdresse}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hopitalAutreTelephone">Téléphone</Label>
                      <Input
                        id="hopitalAutreTelephone"
                        name="hopitalAutreTelephone"
                        value={formData.hopitalAutreTelephone}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hopitalAutreEmail">Email</Label>
                      <Input
                        id="hopitalAutreEmail"
                        name="hopitalAutreEmail"
                        type="email"
                        value={formData.hopitalAutreEmail}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 5: Certificat d'accouchement */}
          <Card>
            <CardHeader>
              <CardTitle>5. Certificat d'Accouchement</CardTitle>
              <CardDescription>
                Renseignez les informations du certificat d'accouchement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="certificatNumero">Numéro du certificat *</Label>
                  <Input
                    id="certificatNumero"
                    name="certificatNumero"
                    value={formData.certificatNumero}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="certificatDateDelivrance">Date de délivrance *</Label>
                  <Input
                    id="certificatDateDelivrance"
                    name="certificatDateDelivrance"
                    type="date"
                    value={formData.certificatDateDelivrance}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="certificatAccouchement">
                  Fichier du certificat d'accouchement * 
                  {documents.certificatAccouchement && (
                    <span className="text-green-600 ml-2">✓ Fichier ajouté</span>
                  )}
                </Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="certificatAccouchement"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, "certificatAccouchement")}
                    className="flex-1"
                    required
                  />
                  <Upload className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 6: Documents justificatifs */}
          <Card>
            <CardHeader>
              <CardTitle>6. Documents Justificatifs</CardTitle>
              <CardDescription>
                Téléversez les documents requis (PDF, JPG, PNG)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="idPere">
                  Pièce d'identité du père
                  {documents.idPere && (
                    <span className="text-green-600 ml-2">✓ Fichier ajouté</span>
                  )}
                </Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="idPere"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, "idPere")}
                    className="flex-1"
                  />
                  <Upload className="h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="idMere">
                  Pièce d'identité de la mère
                  {documents.idMere && (
                    <span className="text-green-600 ml-2">✓ Fichier ajouté</span>
                  )}
                </Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="idMere"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, "idMere")}
                    className="flex-1"
                  />
                  <Upload className="h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="autres">
                  Autres documents (optionnel)
                  {documents.autres && (
                    <span className="text-green-600 ml-2">✓ Fichier ajouté</span>
                  )}
                </Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="autres"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, "autres")}
                    className="flex-1"
                  />
                  <Upload className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => {
                window.location.href = "/dashboard";
              }}
            >
              Annuler
            </Button>
            <Button 
              type="submit"
              className="bg-senegal-green hover:bg-senegal-green-dark"
              disabled={loading || loadingData}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Soumission...
                </>
              ) : (
                "Soumettre la Déclaration"
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
