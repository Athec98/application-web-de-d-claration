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
import { isValidName, isValidNumber, isValidAddress, isValidTime, isValidWeight, isValidHeight } from "@/utils/validation";

export default function NewDeclaration() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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
      setLoadingData(true);
      const data = await geographicService.getHopitaux({ 
        region: regionId, 
        delivreCertificat: true 
      });
      setHopitaux(data);
      if (data.length === 0) {
        console.log("Aucun hôpital trouvé pour cette région");
        toast.info("Aucun hôpital trouvé pour cette région. Vous pouvez utiliser l'option 'Autre' pour saisir les détails manuellement.");
      } else {
        console.log(`${data.length} hôpital(aux) trouvé(s)`);
      }
    } catch (error: any) {
      console.error("Erreur lors du chargement des hôpitaux:", error);
      const errorMessage = error.response?.data?.message || error.message || "Erreur lors du chargement des hôpitaux";
      toast.error(errorMessage);
      setHopitaux([]);
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fieldName = e.target.name;
    const value = e.target.value;
    
    setFormData({
      ...formData,
      [fieldName]: value,
    });

    // Validation en temps réel
    let error = '';
    
    if (fieldName === 'prenomEnfant' || fieldName === 'nomEnfant' || fieldName === 'nomPere' || fieldName === 'prenomPere' || fieldName === 'nomMere' || fieldName === 'prenomMere' || fieldName === 'nomJeuneFilleMere') {
      if (value.trim() && !isValidName(value)) {
        error = 'Ce champ ne doit contenir que des lettres, espaces, tirets et apostrophes';
      }
    } else if (fieldName === 'certificatNumero') {
      if (value.trim() && !isValidNumber(value)) {
        error = 'Le numéro du certificat ne doit contenir que des chiffres';
      }
    } else if (fieldName === 'lieuNaissance') {
      if (value.trim() && !isValidAddress(value)) {
        error = 'Le lieu de naissance doit contenir au moins 5 caractères';
      }
    } else if (fieldName === 'poids') {
      if (value.trim() && !isValidWeight(value)) {
        error = 'Le poids doit être un nombre positif entre 0 et 10 kg';
      }
    } else if (fieldName === 'taille') {
      if (value.trim() && !isValidHeight(value)) {
        error = 'La taille doit être un nombre positif entre 0 et 100 cm';
      }
    } else if (fieldName === 'heureNaissance') {
      if (value.trim() && !isValidTime(value)) {
        error = 'L\'heure de naissance doit être au format HH:MM (ex: 14:30)';
      }
    } else if (fieldName === 'hopitalAutreNom') {
      if (value.trim() && value.trim().length < 2) {
        error = 'Le nom de l\'hôpital doit contenir au moins 2 caractères';
      }
    }

    setFieldErrors({ ...fieldErrors, [fieldName]: error });
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
    e.stopPropagation(); // Empêcher la validation HTML5
    
    // Réinitialiser les erreurs de champ
    const newFieldErrors: Record<string, string> = {};
    const errors: string[] = [];

    // Validations géographiques
    if (!selectedRegion) {
      newFieldErrors.region = "La région est obligatoire";
      errors.push("La région est obligatoire");
    }
    if (!selectedDepartement) {
      newFieldErrors.departement = "Le département est obligatoire";
      errors.push("Le département est obligatoire");
    }
    if (!selectedMairie) {
      newFieldErrors.mairie = "La mairie est obligatoire";
      errors.push("La mairie est obligatoire");
    }

    // Validations enfant
    if (!formData.prenomEnfant || formData.prenomEnfant.trim() === "") {
      newFieldErrors.prenomEnfant = "Le prénom de l'enfant est obligatoire";
      errors.push("Le prénom de l'enfant est obligatoire");
    } else if (!isValidName(formData.prenomEnfant)) {
      newFieldErrors.prenomEnfant = "Le prénom de l'enfant ne doit contenir que des lettres, espaces, tirets et apostrophes";
      errors.push("Le prénom de l'enfant ne doit contenir que des lettres, espaces, tirets et apostrophes");
    }
    if (!formData.nomEnfant || formData.nomEnfant.trim() === "") {
      newFieldErrors.nomEnfant = "Le nom de l'enfant est obligatoire";
      errors.push("Le nom de l'enfant est obligatoire");
    } else if (!isValidName(formData.nomEnfant)) {
      newFieldErrors.nomEnfant = "Le nom de l'enfant ne doit contenir que des lettres, espaces, tirets et apostrophes";
      errors.push("Le nom de l'enfant ne doit contenir que des lettres, espaces, tirets et apostrophes");
    }
    if (!formData.sexe) {
      newFieldErrors.sexe = "Le sexe de l'enfant est obligatoire";
      errors.push("Le sexe de l'enfant est obligatoire");
    }
    if (!formData.dateNaissance) {
      newFieldErrors.dateNaissance = "La date de naissance est obligatoire";
      errors.push("La date de naissance est obligatoire");
    } else {
      // Vérifier que la date n'est pas dans le futur
      const dateNaissance = new Date(formData.dateNaissance);
      const aujourdhui = new Date();
      if (dateNaissance > aujourdhui) {
        newFieldErrors.dateNaissance = "La date de naissance ne peut pas être dans le futur";
        errors.push("La date de naissance ne peut pas être dans le futur");
      }
    }
    if (!formData.lieuNaissance || formData.lieuNaissance.trim() === "") {
      newFieldErrors.lieuNaissance = "Le lieu de naissance est obligatoire";
      errors.push("Le lieu de naissance est obligatoire");
    } else if (!isValidAddress(formData.lieuNaissance)) {
      newFieldErrors.lieuNaissance = "Le lieu de naissance doit contenir au moins 5 caractères";
      errors.push("Le lieu de naissance doit contenir au moins 5 caractères");
    }

    // Validations parents
    if (!formData.nomPere || formData.nomPere.trim() === "") {
      newFieldErrors.nomPere = "Le nom du père est obligatoire";
      errors.push("Le nom du père est obligatoire");
    } else if (!isValidName(formData.nomPere)) {
      newFieldErrors.nomPere = "Le nom du père ne doit contenir que des lettres, espaces, tirets et apostrophes";
      errors.push("Le nom du père ne doit contenir que des lettres, espaces, tirets et apostrophes");
    }
    if (formData.prenomPere && formData.prenomPere.trim() !== "" && !isValidName(formData.prenomPere)) {
      newFieldErrors.prenomPere = "Le prénom du père ne doit contenir que des lettres, espaces, tirets et apostrophes";
      errors.push("Le prénom du père ne doit contenir que des lettres, espaces, tirets et apostrophes");
    }
    if (!formData.nomMere || formData.nomMere.trim() === "") {
      newFieldErrors.nomMere = "Le nom de la mère est obligatoire";
      errors.push("Le nom de la mère est obligatoire");
    } else if (!isValidName(formData.nomMere)) {
      newFieldErrors.nomMere = "Le nom de la mère ne doit contenir que des lettres, espaces, tirets et apostrophes";
      errors.push("Le nom de la mère ne doit contenir que des lettres, espaces, tirets et apostrophes");
    }
    if (formData.prenomMere && formData.prenomMere.trim() !== "" && !isValidName(formData.prenomMere)) {
      newFieldErrors.prenomMere = "Le prénom de la mère ne doit contenir que des lettres, espaces, tirets et apostrophes";
      errors.push("Le prénom de la mère ne doit contenir que des lettres, espaces, tirets et apostrophes");
    }
    if (formData.nomJeuneFilleMere && formData.nomJeuneFilleMere.trim() !== "" && !isValidName(formData.nomJeuneFilleMere)) {
      newFieldErrors.nomJeuneFilleMere = "Le nom de jeune fille de la mère ne doit contenir que des lettres, espaces, tirets et apostrophes";
      errors.push("Le nom de jeune fille de la mère ne doit contenir que des lettres, espaces, tirets et apostrophes");
    }

    // Validations hôpital
    if (!selectedHopital) {
      newFieldErrors.hopital = "L'hôpital d'accouchement est obligatoire";
      errors.push("L'hôpital d'accouchement est obligatoire");
    } else if (selectedHopital === "autre") {
      if (!formData.hopitalAutreNom || formData.hopitalAutreNom.trim() === "") {
        newFieldErrors.hopitalAutreNom = "Le nom de l'hôpital est obligatoire lorsque vous sélectionnez 'Autre'";
        errors.push("Le nom de l'hôpital est obligatoire lorsque vous sélectionnez 'Autre'");
      }
      if (!formData.hopitalAutreType) {
        newFieldErrors.hopitalAutreType = "Le type d'établissement est obligatoire";
        errors.push("Le type d'établissement est obligatoire");
      }
    }

    // Validations certificat
    if (!formData.certificatNumero || formData.certificatNumero.trim() === "") {
      newFieldErrors.certificatNumero = "Le numéro du certificat d'accouchement est obligatoire";
      errors.push("Le numéro du certificat d'accouchement est obligatoire");
    } else if (!isValidNumber(formData.certificatNumero)) {
      newFieldErrors.certificatNumero = "Le numéro du certificat d'accouchement ne doit contenir que des chiffres";
      errors.push("Le numéro du certificat d'accouchement ne doit contenir que des chiffres");
    }
    if (!formData.certificatDateDelivrance) {
      newFieldErrors.certificatDateDelivrance = "La date de délivrance du certificat est obligatoire";
      errors.push("La date de délivrance du certificat est obligatoire");
    } else {
      // Vérifier que la date de délivrance n'est pas dans le futur
      const dateDelivrance = new Date(formData.certificatDateDelivrance);
      const aujourdhui = new Date();
      if (dateDelivrance > aujourdhui) {
        newFieldErrors.certificatDateDelivrance = "La date de délivrance du certificat ne peut pas être dans le futur";
        errors.push("La date de délivrance du certificat ne peut pas être dans le futur");
      }
      // Vérifier que la date de délivrance n'est pas antérieure à la date de naissance
      if (formData.dateNaissance) {
        const dateNaissance = new Date(formData.dateNaissance);
        if (dateDelivrance < dateNaissance) {
          newFieldErrors.certificatDateDelivrance = "La date de délivrance du certificat ne peut pas être antérieure à la date de naissance";
          errors.push("La date de délivrance du certificat ne peut pas être antérieure à la date de naissance");
        }
      }
    }

    if (!documents.certificatAccouchement) {
      newFieldErrors.certificatAccouchement = "Le certificat d'accouchement doit être téléversé";
      errors.push("Le certificat d'accouchement doit être téléversé");
    }

    // Validations optionnelles avec format
    if (formData.poids && !isValidWeight(formData.poids)) {
      newFieldErrors.poids = "Le poids doit être un nombre positif entre 0 et 10 kg";
      errors.push("Le poids doit être un nombre positif entre 0 et 10 kg");
    }
    if (formData.taille && !isValidHeight(formData.taille)) {
      newFieldErrors.taille = "La taille doit être un nombre positif entre 0 et 100 cm";
      errors.push("La taille doit être un nombre positif entre 0 et 100 cm");
    }
    if (formData.heureNaissance && !isValidTime(formData.heureNaissance)) {
      newFieldErrors.heureNaissance = "L'heure de naissance doit être au format HH:MM (ex: 14:30)";
      errors.push("L'heure de naissance doit être au format HH:MM (ex: 14:30)");
    }

    // Afficher les erreurs
    setFieldErrors(newFieldErrors);
    if (errors.length > 0) {
      toast.error(`Veuillez corriger les erreurs suivantes : ${errors.join(", ")}`);
      return;
    }

    setLoading(true);

    try {
      // Créer FormData pour envoyer les fichiers
      const formDataToSend = new FormData();
      
      // Ajouter les données de déclaration
      formDataToSend.append('nomEnfant', formData.nomEnfant);
      formDataToSend.append('prenomEnfant', formData.prenomEnfant);
      formDataToSend.append('sexe', formData.sexe);
      formDataToSend.append('dateNaissance', formData.dateNaissance);
      if (formData.heureNaissance) {
        formDataToSend.append('heureNaissance', formData.heureNaissance);
      }
      formDataToSend.append('lieuNaissance', formData.lieuNaissance);
      if (formData.poids) {
        formDataToSend.append('poids', formData.poids);
      }
      if (formData.taille) {
        formDataToSend.append('taille', formData.taille);
      }
      formDataToSend.append('nomPere', formData.nomPere);
      if (formData.prenomPere) {
        formDataToSend.append('prenomPere', formData.prenomPere);
      }
      if (formData.professionPere) {
        formDataToSend.append('professionPere', formData.professionPere);
      }
      if (formData.nationalitePere) {
        formDataToSend.append('nationalitePere', formData.nationalitePere);
      }
      formDataToSend.append('nomMere', formData.nomMere);
      if (formData.prenomMere) {
        formDataToSend.append('prenomMere', formData.prenomMere);
      }
      if (formData.nomJeuneFilleMere) {
        formDataToSend.append('nomJeuneFilleMere', formData.nomJeuneFilleMere);
      }
      if (formData.professionMere) {
        formDataToSend.append('professionMere', formData.professionMere);
      }
      if (formData.nationaliteMere) {
        formDataToSend.append('nationaliteMere', formData.nationaliteMere);
      }
      formDataToSend.append('region', selectedRegion);
      formDataToSend.append('departement', selectedDepartement);
      if (selectedCommune) {
        formDataToSend.append('commune', selectedCommune);
      }
      formDataToSend.append('mairie', selectedMairie);
      formDataToSend.append('hopitalAccouchement', selectedHopital === "autre" ? "" : selectedHopital);
      if (selectedHopital === "autre") {
        formDataToSend.append('hopitalAutre', JSON.stringify({
          nom: formData.hopitalAutreNom,
          type: formData.hopitalAutreType,
          adresse: formData.hopitalAutreAdresse || undefined,
          telephone: formData.hopitalAutreTelephone || undefined,
          email: formData.hopitalAutreEmail || undefined,
        }));
      }
      formDataToSend.append('certificatAccouchement', JSON.stringify({
        numero: formData.certificatNumero,
        dateDelivrance: formData.certificatDateDelivrance,
      }));

      // Ajouter les fichiers
      if (documents.certificatAccouchement) {
        formDataToSend.append('certificatAccouchement', documents.certificatAccouchement);
      }
      if (documents.idPere) {
        formDataToSend.append('idPere', documents.idPere);
      }
      if (documents.idMere) {
        formDataToSend.append('idMere', documents.idMere);
      }
      if (documents.autres) {
        formDataToSend.append('autres', documents.autres);
      }

      await declarationService.createDeclarationWithFiles(formDataToSend);
      
      toast.success("Déclaration soumise avec succès !");
      window.location.href = "/dashboard";
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || "Erreur lors de la soumission de la déclaration";
      toast.error(errorMessage);
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
                    onBlur={(e) => {
                      if (!e.target.value.trim()) {
                        setFieldErrors({ ...fieldErrors, prenomEnfant: 'Le prénom de l\'enfant est obligatoire' });
                      }
                    }}
                  />
                  {fieldErrors.prenomEnfant && (
                    <p className="text-sm text-red-600 mt-1">{fieldErrors.prenomEnfant}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nomEnfant">Nom *</Label>
                  <Input
                    id="nomEnfant"
                    name="nomEnfant"
                    value={formData.nomEnfant}
                    onChange={handleChange}
                    onBlur={(e) => {
                      if (!e.target.value.trim()) {
                        setFieldErrors({ ...fieldErrors, nomEnfant: 'Le nom de l\'enfant est obligatoire' });
                      }
                    }}
                  />
                  {fieldErrors.nomEnfant && (
                    <p className="text-sm text-red-600 mt-1">{fieldErrors.nomEnfant}</p>
                  )}
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
                  />
                  {fieldErrors.dateNaissance && (
                    <p className="text-sm text-red-600 mt-1">{fieldErrors.dateNaissance}</p>
                  )}
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
                  />
                  {fieldErrors.lieuNaissance && (
                    <p className="text-sm text-red-600 mt-1">{fieldErrors.lieuNaissance}</p>
                  )}
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
                    />
                    {fieldErrors.nomPere && (
                      <p className="text-sm text-red-600 mt-1">{fieldErrors.nomPere}</p>
                    )}
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
                    />
                    {fieldErrors.nomMere && (
                      <p className="text-sm text-red-600 mt-1">{fieldErrors.nomMere}</p>
                    )}
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
                      />
                      {fieldErrors.hopitalAutreNom && (
                        <p className="text-sm text-red-600 mt-1">{fieldErrors.hopitalAutreNom}</p>
                      )}
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
                  />
                  {fieldErrors.certificatNumero && (
                    <p className="text-sm text-red-600 mt-1">{fieldErrors.certificatNumero}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="certificatDateDelivrance">Date de délivrance *</Label>
                  <Input
                    id="certificatDateDelivrance"
                    name="certificatDateDelivrance"
                    type="date"
                    value={formData.certificatDateDelivrance}
                    onChange={handleChange}
                  />
                  {fieldErrors.certificatDateDelivrance && (
                    <p className="text-sm text-red-600 mt-1">{fieldErrors.certificatDateDelivrance}</p>
                  )}
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
                    onChange={(e) => {
                      handleFileChange(e, "certificatAccouchement");
                      if (fieldErrors.certificatAccouchement) {
                        setFieldErrors({ ...fieldErrors, certificatAccouchement: "" });
                      }
                    }}
                    className="flex-1"
                  />
                  {fieldErrors.certificatAccouchement && (
                    <p className="text-sm text-red-600 mt-1">{fieldErrors.certificatAccouchement}</p>
                  )}
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
