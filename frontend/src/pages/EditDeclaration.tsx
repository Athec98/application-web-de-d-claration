import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, Upload, AlertCircle, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { geographicService, type Region, type Departement, type Commune, type Mairie, type Hopital } from "@/services/geographicService";
import { declarationService, type Declaration } from "@/services/declarationService";
import { isValidName, isValidNumber, isValidAddress, isValidTime, isValidWeight, isValidHeight } from "@/utils/validation";

export default function EditDeclaration() {
  const navigate = useNavigate();
  const { id: declarationId } = useParams<{ id: string }>();
  
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingDeclaration, setLoadingDeclaration] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [declaration, setDeclaration] = useState<Declaration | null>(null);

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

  // Charger la déclaration et les données géographiques
  useEffect(() => {
    if (declarationId) {
      loadDeclaration();
      loadRegions();
    }
    // Si pas d'ID, ne rien faire (l'utilisateur peut naviguer normalement)
    // Ne pas rediriger automatiquement pour éviter de bloquer la navigation
  }, [declarationId]);

  // Charger les départements quand une région est sélectionnée
  useEffect(() => {
    if (selectedRegion) {
      loadDepartements(selectedRegion);
    }
  }, [selectedRegion]);

  // Charger les communes et mairies quand un département est sélectionné
  useEffect(() => {
    if (selectedDepartement) {
      loadCommunes(selectedDepartement);
      loadMairies(selectedDepartement);
    }
  }, [selectedDepartement]);

  // Charger les hôpitaux quand une région est sélectionnée
  useEffect(() => {
    if (selectedRegion) {
      loadHopitaux(selectedRegion);
    }
  }, [selectedRegion]);

  const loadDeclaration = async () => {
    if (!declarationId) {
      // Si pas d'ID, ne pas charger et rediriger silencieusement
      navigate("/dashboard");
      return;
    }
    
    try {
      setLoadingDeclaration(true);
      const data = await declarationService.getDeclarationById(declarationId);
      setDeclaration(data);
      
      // Vérifier que le statut permet la modification
      const allowedStatuses = ['en_attente', 'en_cours_mairie', 'en_cours'];
      if (!allowedStatuses.includes(data.statut)) {
        toast.error(`Vous ne pouvez modifier une déclaration qu'en statut "en attente" ou "en cours". Statut actuel: ${data.statut}`);
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
        return;
      }
      
      // Remplir le formulaire avec les données existantes
      setFormData({
        nomEnfant: data.nomEnfant || "",
        prenomEnfant: data.prenomEnfant || "",
        sexe: (data.sexe as "M" | "F") || "",
        dateNaissance: data.dateNaissance ? new Date(data.dateNaissance).toISOString().split('T')[0] : "",
        heureNaissance: data.heureNaissance || "",
        lieuNaissance: data.lieuNaissance || "",
        poids: data.poids?.toString() || "",
        taille: data.taille?.toString() || "",
        nomPere: data.nomPere || "",
        prenomPere: data.prenomPere || "",
        professionPere: data.professionPere || "",
        nationalitePere: data.nationalitePere || "",
        nomMere: data.nomMere || "",
        prenomMere: data.prenomMere || "",
        nomJeuneFilleMere: data.nomJeuneFilleMere || "",
        professionMere: data.professionMere || "",
        nationaliteMere: data.nationaliteMere || "",
        hopitalAutreNom: data.hopitalAutre?.nom || "",
        hopitalAutreType: data.hopitalAutre?.type || "",
        hopitalAutreAdresse: data.hopitalAutre?.adresse || "",
        hopitalAutreTelephone: data.hopitalAutre?.telephone || "",
        hopitalAutreEmail: data.hopitalAutre?.email || "",
        certificatNumero: data.certificatAccouchement?.numero || "",
        certificatDateDelivrance: data.certificatAccouchement?.dateDelivrance ? new Date(data.certificatAccouchement.dateDelivrance).toISOString().split('T')[0] : "",
      });
      
      // Remplir les sélections géographiques
      if (data.region) {
        const regionValue: any = data.region;
        const regionId = typeof regionValue === 'object' && regionValue !== null 
          ? (regionValue._id || regionValue.id || regionValue) 
          : regionValue;
        setSelectedRegion(String(regionId));
      }
      if (data.departement) {
        const deptValue: any = data.departement;
        const deptId = typeof deptValue === 'object' && deptValue !== null 
          ? (deptValue._id || deptValue.id || deptValue) 
          : deptValue;
        setSelectedDepartement(String(deptId));
      }
      if (data.commune) {
        const communeValue: any = data.commune;
        const communeId = typeof communeValue === 'object' && communeValue !== null 
          ? (communeValue._id || communeValue.id || communeValue) 
          : communeValue;
        setSelectedCommune(String(communeId));
      }
      if (data.mairie) {
        const mairieValue: any = data.mairie;
        const mairieId = typeof mairieValue === 'object' && mairieValue !== null 
          ? (mairieValue._id || mairieValue.id || mairieValue) 
          : mairieValue;
        setSelectedMairie(String(mairieId));
      }
      
      // Remplir l'hôpital
      if (data.hopitalAccouchement) {
        const hopitalValue: any = data.hopitalAccouchement;
        const hopitalId = typeof hopitalValue === 'object' && hopitalValue !== null 
          ? (hopitalValue._id || hopitalValue.id || hopitalValue) 
          : hopitalValue;
        setSelectedHopital(String(hopitalId));
        setShowHopitalAutre(false);
      } else if (data.hopitalAutre) {
        setSelectedHopital("autre");
        setShowHopitalAutre(true);
      }
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Erreur lors du chargement de la déclaration";
      toast.error(errorMessage);
      // Rediriger après un court délai pour permettre à l'utilisateur de voir le message
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } finally {
      setLoadingDeclaration(false);
      setLoadingData(false);
    }
  };

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
    } catch (error: any) {
      toast.error("Erreur lors du chargement des départements");
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
    } catch (error: any) {
      toast.error("Erreur lors du chargement des communes");
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
    } catch (error: any) {
      toast.error("Erreur lors du chargement des mairies");
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
    } catch (error: any) {
      toast.error("Erreur lors du chargement des hôpitaux");
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
      if (fieldErrors[field]) {
        setFieldErrors({ ...fieldErrors, [field]: "" });
      }
    }
  };

  const handleHopitalChange = (value: string) => {
    setSelectedHopital(value);
    setShowHopitalAutre(value === "autre");
    if (value !== "autre") {
      setFormData({
        ...formData,
        hopitalAutreNom: "",
        hopitalAutreType: "",
        hopitalAutreAdresse: "",
        hopitalAutreTelephone: "",
        hopitalAutreEmail: "",
      });
    }
    if (fieldErrors.hopital) setFieldErrors({ ...fieldErrors, hopital: "" });
  };

  const handleSelectChange = (value: string, fieldName: string) => {
    switch (fieldName) {
      case 'region':
        setSelectedRegion(value);
        setSelectedDepartement("");
        setSelectedCommune("");
        setSelectedMairie("");
        setMairies([]);
        setCommunes([]);
        break;
      case 'departement':
        setSelectedDepartement(value);
        setSelectedCommune("");
        setSelectedMairie("");
        setMairies([]);
        setCommunes([]);
        break;
      case 'commune':
        setSelectedCommune(value);
        break;
      case 'mairie':
        setSelectedMairie(value);
        break;
      case 'sexe':
        setFormData({ ...formData, sexe: value as "M" | "F" });
        break;
      case 'hopitalAutreType':
        setFormData({ ...formData, hopitalAutreType: value });
        break;
    }
    if (fieldErrors[fieldName]) {
      setFieldErrors({ ...fieldErrors, [fieldName]: "" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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
      const dateDelivrance = new Date(formData.certificatDateDelivrance);
      const aujourdhui = new Date();
      if (dateDelivrance > aujourdhui) {
        newFieldErrors.certificatDateDelivrance = "La date de délivrance du certificat ne peut pas être dans le futur";
        errors.push("La date de délivrance du certificat ne peut pas être dans le futur");
      }
      if (formData.dateNaissance) {
        const dateNaissance = new Date(formData.dateNaissance);
        if (dateDelivrance < dateNaissance) {
          newFieldErrors.certificatDateDelivrance = "La date de délivrance du certificat ne peut pas être antérieure à la date de naissance";
          errors.push("La date de délivrance du certificat ne peut pas être antérieure à la date de naissance");
        }
      }
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

    setFieldErrors(newFieldErrors);
    if (errors.length > 0) {
      toast.error(`Veuillez corriger les erreurs suivantes : ${errors.join(", ")}`);
      return;
    }

    setLoading(true);

    try {
      if (!declarationId) {
        toast.error("ID de déclaration manquant. Redirection vers le tableau de bord...");
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
        return;
      }

      const formDataToSend = new FormData();
      
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

      await declarationService.updateDeclaration(declarationId, formDataToSend);
      
      toast.success("Déclaration mise à jour avec succès !");
      // Utiliser navigate pour une navigation plus fluide
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || "Erreur lors de la mise à jour de la déclaration";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loadingDeclaration) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-senegal-green mx-auto mb-4" />
          <p className="text-gray-600">Chargement de la déclaration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-senegal-green-dark">
                Modifier la Déclaration
              </h1>
              <p className="text-sm text-gray-600">
                Corrigez les informations de votre déclaration
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {declaration?.statut === 'rejetee' && declaration.motifRejet && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Déclaration rejetée</AlertTitle>
            <AlertDescription>
              <strong>Motif :</strong> {declaration.motifRejet}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Informations géographiques et mairie */}
          <Card>
            <CardHeader>
              <CardTitle>1. Localisation et Mairie</CardTitle>
              <CardDescription>
                Sélectionnez votre région, département, commune et la mairie
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="region">Région *</Label>
                  <Select 
                    value={selectedRegion}
                    onValueChange={(value) => handleSelectChange(value, 'region')}
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
                    onValueChange={(value) => handleSelectChange(value, 'departement')}
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
                    onValueChange={(value) => handleSelectChange(value, 'commune')}
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
                    onValueChange={(value) => handleSelectChange(value, 'mairie')}
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
                    onValueChange={(value) => handleSelectChange(value, 'sexe')}
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
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({ ...formData, dateNaissance: value });
                      if (value) {
                        const date = new Date(value);
                        const aujourdhui = new Date();
                        if (date > aujourdhui) {
                          setFieldErrors({ ...fieldErrors, dateNaissance: 'La date de naissance ne peut pas être dans le futur' });
                        } else {
                          setFieldErrors({ ...fieldErrors, dateNaissance: '' });
                        }
                      }
                    }}
                    onBlur={(e) => {
                      if (!e.target.value) {
                        setFieldErrors({ ...fieldErrors, dateNaissance: 'La date de naissance est obligatoire' });
                      }
                    }}
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
                  {fieldErrors.heureNaissance && (
                    <p className="text-sm text-red-600 mt-1">{fieldErrors.heureNaissance}</p>
                  )}
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
                    onBlur={(e) => {
                      if (!e.target.value.trim()) {
                        setFieldErrors({ ...fieldErrors, lieuNaissance: 'Le lieu de naissance est obligatoire' });
                      }
                    }}
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
                  {fieldErrors.poids && (
                    <p className="text-sm text-red-600 mt-1">{fieldErrors.poids}</p>
                  )}
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
                  {fieldErrors.taille && (
                    <p className="text-sm text-red-600 mt-1">{fieldErrors.taille}</p>
                  )}
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
                    {fieldErrors.prenomPere && (
                      <p className="text-sm text-red-600 mt-1">{fieldErrors.prenomPere}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nomPere">Nom *</Label>
                    <Input
                      id="nomPere"
                      name="nomPere"
                      value={formData.nomPere}
                      onChange={handleChange}
                      onBlur={(e) => {
                        if (!e.target.value.trim()) {
                          setFieldErrors({ ...fieldErrors, nomPere: 'Le nom du père est obligatoire' });
                        }
                      }}
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
                    {fieldErrors.prenomMere && (
                      <p className="text-sm text-red-600 mt-1">{fieldErrors.prenomMere}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nomMere">Nom *</Label>
                    <Input
                      id="nomMere"
                      name="nomMere"
                      value={formData.nomMere}
                      onChange={handleChange}
                      onBlur={(e) => {
                        if (!e.target.value.trim()) {
                          setFieldErrors({ ...fieldErrors, nomMere: 'Le nom de la mère est obligatoire' });
                        }
                      }}
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
                    {fieldErrors.nomJeuneFilleMere && (
                      <p className="text-sm text-red-600 mt-1">{fieldErrors.nomJeuneFilleMere}</p>
                    )}
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
                        onValueChange={(value) => handleSelectChange(value, 'hopitalAutreType')}
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
                    onBlur={(e) => {
                      if (!e.target.value.trim()) {
                        setFieldErrors({ ...fieldErrors, certificatNumero: 'Le numéro du certificat d\'accouchement est obligatoire' });
                      }
                    }}
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
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({ ...formData, certificatDateDelivrance: value });
                      if (value) {
                        const dateDelivrance = new Date(value);
                        const aujourdhui = new Date();
                        if (dateDelivrance > aujourdhui) {
                          setFieldErrors({ ...fieldErrors, certificatDateDelivrance: 'La date de délivrance ne peut pas être dans le futur' });
                        } else if (formData.dateNaissance) {
                          const dateNaissance = new Date(formData.dateNaissance);
                          if (dateDelivrance < dateNaissance) {
                            setFieldErrors({ ...fieldErrors, certificatDateDelivrance: 'La date de délivrance ne peut pas être antérieure à la date de naissance' });
                          } else {
                            setFieldErrors({ ...fieldErrors, certificatDateDelivrance: '' });
                          }
                        } else {
                          setFieldErrors({ ...fieldErrors, certificatDateDelivrance: '' });
                        }
                      }
                    }}
                    onBlur={(e) => {
                      if (!e.target.value) {
                        setFieldErrors({ ...fieldErrors, certificatDateDelivrance: 'La date de délivrance du certificat est obligatoire' });
                      }
                    }}
                  />
                  {fieldErrors.certificatDateDelivrance && (
                    <p className="text-sm text-red-600 mt-1">{fieldErrors.certificatDateDelivrance}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="certificatAccouchement">
                  Fichier du certificat d'accouchement (nouveau)
                  {documents.certificatAccouchement && (
                    <span className="text-green-600 ml-2">✓ Nouveau fichier ajouté</span>
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
                  <Upload className="h-5 w-5 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500">
                  Si vous ne téléversez pas de nouveau fichier, l'ancien sera conservé.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 6: Documents justificatifs */}
          <Card>
            <CardHeader>
              <CardTitle>6. Documents Justificatifs</CardTitle>
              <CardDescription>
                Téléversez de nouveaux documents si nécessaire (PDF, JPG, PNG)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  Si vous ne téléversez pas de nouveau document, l'ancien sera conservé.
                  Téléversez uniquement les documents que vous souhaitez remplacer.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="idPere">
                  Pièce d'identité du père (nouveau)
                  {documents.idPere && (
                    <span className="text-green-600 ml-2">✓ Nouveau fichier ajouté</span>
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
                  Pièce d'identité de la mère (nouveau)
                  {documents.idMere && (
                    <span className="text-green-600 ml-2">✓ Nouveau fichier ajouté</span>
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
                    <span className="text-green-600 ml-2">✓ Nouveau fichier ajouté</span>
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
              onClick={() => navigate("/dashboard")}
            >
              Annuler
            </Button>
            <Button 
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 shadow-md"
              disabled={loading || loadingData}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mise à jour...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Mettre à jour la Déclaration
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
