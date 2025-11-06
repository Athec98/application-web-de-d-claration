import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft, 
  FileText, 
  Send, 
  XCircle, 
  CheckCircle,
  Download,
  Image as ImageIcon,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { declarationService, type Declaration } from "@/services/declarationService";
import { geographicService, type Hopital } from "@/services/geographicService";
import { acteNaissanceService } from "@/services/acteNaissanceService";
import { getFileUrl } from "@/utils/fileUtils";

export default function MairieDeclarationDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const declarationId = id;
  
  const [declaration, setDeclaration] = useState<Declaration | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [sendToHospitalDialogOpen, setSendToHospitalDialogOpen] = useState(false);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [validateConfirmDialogOpen, setValidateConfirmDialogOpen] = useState(false);
  const [archiveConfirmDialogOpen, setArchiveConfirmDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  
  // Hôpitaux suggérés
  const [suggestedHospitals, setSuggestedHospitals] = useState<Hopital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<string>("");
  const [loadingHospitals, setLoadingHospitals] = useState(false);

  // Données du certificat à générer
  const [certificateData, setCertificateData] = useState({
    timbreNumeriqueUrl: "",
    cachetNumeriqueUrl: "",
    timbreFile: null as File | null,
    cachetFile: null as File | null,
  });

  const loadDeclaration = async () => {
    if (!declarationId) {
      toast.error("ID de déclaration manquant dans l'URL");
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const data = await declarationService.getDeclarationById(declarationId);
      // Log pour déboguer les documents
      if (data && data.documents) {
        // Les documents sont déjà dans la déclaration
      }
      setDeclaration(data);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Erreur lors du chargement de la déclaration";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Charger la déclaration
  useEffect(() => {
    loadDeclaration();
  }, [declarationId]);

  // Charger les hôpitaux suggérés quand la déclaration est chargée
  useEffect(() => {
    if (declaration && sendToHospitalDialogOpen) {
      loadSuggestedHospitals();
    }
  }, [declaration, sendToHospitalDialogOpen]);

  const loadSuggestedHospitals = async () => {
    if (!declarationId) return;
    
    try {
      setLoadingHospitals(true);
      const response = await declarationService.getSuggestedHospitals(declarationId);
      setSuggestedHospitals(response.hopitaux || []);
      
      // Pré-sélectionner l'hôpital d'accouchement si disponible
      if (declaration?.hopitalAccouchement) {
        setSelectedHospital(declaration.hopitalAccouchement.toString());
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Erreur lors du chargement des hôpitaux";
      toast.error(errorMessage);
    } finally {
      setLoadingHospitals(false);
    }
  };

  const handleSendToHospital = async () => {
    if (!selectedHospital) {
      toast.error("Veuillez sélectionner un hôpital");
      return;
    }

    if (!declarationId) return;

    setLoadingAction(true);
    try {
      await declarationService.sendToHospital(declarationId, selectedHospital);
      toast.success("Demande envoyée à l'hôpital pour vérification");
      setSendToHospitalDialogOpen(false);
      await loadDeclaration(); // Recharger pour mettre à jour le statut
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Erreur lors de l'envoi à l'hôpital";
      toast.error(errorMessage);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleValidate = () => {
    if (!declarationId) return;
    setValidateConfirmDialogOpen(true);
  };

  const confirmValidate = async () => {
    if (!declarationId) return;
    setValidateConfirmDialogOpen(false);
    setLoadingAction(true);
    try {
      await declarationService.validateDeclaration(declarationId);
      toast.success("Déclaration validée avec succès. Le parent a été notifié.");
      await loadDeclaration(); // Recharger pour mettre à jour le statut
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de la validation");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Veuillez préciser le motif du rejet");
      return;
    }

    if (!declarationId) return;

    setLoadingAction(true);
    try {
      await declarationService.rejectDeclaration(declarationId, rejectionReason);
      toast.success("Demande rejetée. Le parent a été notifié.");
      setRejectDialogOpen(false);
      setRejectionReason("");
      await loadDeclaration(); // Recharger pour mettre à jour le statut
    } catch (error: any) {
      console.error("Erreur lors du rejet:", error);
      toast.error(error.response?.data?.message || "Erreur lors du rejet");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleGenerateCertificate = async () => {
    if (!declarationId) return;

    setLoadingAction(true);
    try {
      // Le backend génère automatiquement le timbre et le cachet numérique
      // Toutes les informations de la déclaration sont incluses dans l'acte :
      // - Informations de l'enfant (nom, prénom, date, heure, lieu, sexe)
      // - Informations du père (nom, prénom, profession, nationalité)
      // - Informations de la mère (nom, prénom, nom de jeune fille, profession, nationalité)
      // - Timbre et cachet numérique générés automatiquement
      // - Numéro d'acte et numéro de registre
      
      await acteNaissanceService.generateActeNaissance(declarationId);
      
      toast.success("Acte de naissance généré avec succès avec toutes les informations !");
      setGenerateDialogOpen(false);
      setCertificateData({ timbreNumeriqueUrl: "", cachetNumeriqueUrl: "", timbreFile: null, cachetFile: null }); // Réinitialiser
      await loadDeclaration(); // Recharger pour mettre à jour le statut
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Erreur lors de la génération de l'acte de naissance";
      toast.error(errorMessage);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleArchive = () => {
    if (!declarationId) return;
    setArchiveConfirmDialogOpen(true);
  };

  const confirmArchive = async () => {
    if (!declarationId) return;
    setArchiveConfirmDialogOpen(false);
    setLoadingAction(true);
    try {
      await declarationService.archiveDeclaration(declarationId);
      toast.success("Dossier archivé avec succès !");
      await loadDeclaration(); // Recharger pour mettre à jour le statut
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de l'archivage");
    } finally {
      setLoadingAction(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      en_attente: { label: "En attente", className: "bg-yellow-500" },
      en_cours_mairie: { label: "En cours (Mairie)", className: "bg-blue-500" },
      en_verification_hopital: { label: "En vérification (Hôpital)", className: "bg-purple-500" },
      certificat_valide: { label: "Certificat validé", className: "bg-green-500" },
      certificat_rejete: { label: "Certificat rejeté", className: "bg-red-500" },
      validee: { label: "Validée", className: "bg-green-600" },
      rejetee: { label: "Rejetée", className: "bg-red-600" },
      archivee: { label: "Archivée", className: "bg-gray-500" },
    };

    const config = statusConfig[status] || statusConfig.en_attente;
    
    return (
      <Badge className={`text-white ${config.className}`}>
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-senegal-green" />
      </div>
    );
  }

  if (!declaration) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Déclaration non trouvée</p>
      </div>
    );
  }

  const canSendToHospital = declaration.statut === 'en_cours_mairie';
  // Le bouton "Générer l'acte" doit apparaître quand :
  // - Le statut est "certificat_valide" (après validation du certificat par l'hôpital) OU "validee" (après validation par la mairie)
  // - ET l'acte n'a pas encore été généré
  const canGenerateActe = (declaration.statut === 'certificat_valide' || declaration.statut === 'validee') && !declaration.acteNaissance;
  const canArchive = declaration.statut === 'validee' && declaration.acteNaissance;
  const hasHospitalResponse = declaration.statut === 'certificat_valide' || declaration.statut === 'certificat_rejete' || declaration.statut === 'validee';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => {
                window.location.href = "/mairie/dashboard";
              }}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold" style={{ color: "#006B32" }}>
                Consultation de la Déclaration
              </h1>
              <p className="text-sm text-gray-600">
                Déclaration #{declaration._id}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Statut et Actions */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Statut de la demande</CardTitle>
                <CardDescription>
                  Soumise le {(() => {
                    try {
                      if (!declaration.createdAt) return 'N/A';
                      const date = new Date(declaration.createdAt);
                      return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('fr-FR');
                    } catch {
                      return 'N/A';
                    }
                  })()}
                  {declaration.dateEnvoiMairie && (
                    <> • Envoyée à la mairie le {(() => {
                      try {
                        if (!declaration.dateEnvoiMairie) return 'N/A';
                        const date = new Date(declaration.dateEnvoiMairie);
                        return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('fr-FR');
                      } catch {
                        return 'N/A';
                      }
                    })()}</>
                  )}
                </CardDescription>
              </div>
              {getStatusBadge(declaration.statut)}
            </div>
          </CardHeader>
          <CardContent>
            {canSendToHospital && (
              <div className="flex space-x-4">
                <Button
                  className="text-white"
                  style={{ backgroundColor: "#00853F" }}
                  onClick={() => setSendToHospitalDialogOpen(true)}
                  disabled={loadingAction}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Envoyer à l'hôpital
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setRejectDialogOpen(true)}
                  disabled={loadingAction}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Rejeter la demande
                </Button>
              </div>
            )}

            {hasHospitalResponse && declaration.certificatAccouchement && (
              <div className="space-y-4 mt-4">
                <div className={`p-4 rounded-lg border ${
                  (declaration.certificatAccouchement as any).authentique 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center space-x-2 mb-2">
                    {(declaration.certificatAccouchement as any).authentique ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className={`font-semibold ${
                      (declaration.certificatAccouchement as any).authentique 
                        ? 'text-green-800' 
                        : 'text-red-800'
                    }`}>
                      {(declaration.certificatAccouchement as any).authentique 
                        ? 'Certificat validé par l\'hôpital' 
                        : 'Certificat rejeté par l\'hôpital'}
                    </span>
                  </div>
                  {(declaration.certificatAccouchement as any).motifRejetHopital && (
                    <p className="text-sm text-gray-700 mt-2">
                      Motif: {(declaration.certificatAccouchement as any).motifRejetHopital}
                    </p>
                  )}
                  {(declaration.certificatAccouchement as any).dateVerification && (
                    <p className="text-xs text-gray-500 mt-2">
                      Vérifié le {(() => {
                        try {
                          const dateVerif = (declaration.certificatAccouchement as any)?.dateVerification;
                          if (!dateVerif) return 'N/A';
                          const date = new Date(dateVerif);
                          return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('fr-FR');
                        } catch {
                          return 'N/A';
                        }
                      })()}
                    </p>
                  )}
                </div>

                {/* Actions après validation du certificat par l'hôpital */}
                {declaration.statut === 'certificat_valide' && (
                  <div className="flex space-x-4">
                    <Button
                      className="text-white"
                      style={{ backgroundColor: "#00853F" }}
                      onClick={handleValidate}
                      disabled={loadingAction}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Valider la déclaration
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => setRejectDialogOpen(true)}
                      disabled={loadingAction}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Rejeter la déclaration
                    </Button>
                  </div>
                )}

                {/* Afficher le bouton "Générer l'acte" quand le certificat est validé ou la déclaration est validée, et qu'il n'y a pas encore d'acte */}
                {(declaration.statut === 'certificat_valide' || declaration.statut === 'validee') && !declaration.acteNaissance && (
                  <Button
                    className="text-white"
                    style={{ backgroundColor: "#00853F" }}
                    onClick={() => setGenerateDialogOpen(true)}
                    disabled={loadingAction}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Générer l'acte de naissance
                  </Button>
                )}
                {canArchive && (
                  <Button
                    variant="outline"
                    onClick={handleArchive}
                    disabled={loadingAction}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Archiver le dossier
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informations de la déclaration */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Informations de la Déclaration</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-600">Date de soumission</Label>
              <p className="font-medium">
                {(() => {
                  try {
                    if (!declaration.createdAt) return 'N/A';
                    const date = new Date(declaration.createdAt);
                    if (isNaN(date.getTime())) return 'N/A';
                    return date.toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });
                  } catch {
                    return 'N/A';
                  }
                })()}
              </p>
            </div>
            {declaration.dateEnvoiMairie && (
              <div>
                <Label className="text-gray-600">Date d'envoi à la mairie</Label>
                <p className="font-medium">
                  {(() => {
                    try {
                      if (!declaration.dateEnvoiMairie) return 'N/A';
                      const date = new Date(declaration.dateEnvoiMairie);
                      if (isNaN(date.getTime())) return 'N/A';
                      return date.toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      });
                    } catch {
                      return 'N/A';
                    }
                  })()}
                </p>
              </div>
            )}
            {declaration.dateEnvoiHopital && (
              <div>
                <Label className="text-gray-600">Date d'envoi à l'hôpital</Label>
                <p className="font-medium">
                  {(() => {
                    try {
                      if (!declaration.dateEnvoiHopital) return 'N/A';
                      const date = new Date(declaration.dateEnvoiHopital);
                      if (isNaN(date.getTime())) return 'N/A';
                      return date.toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      });
                    } catch {
                      return 'N/A';
                    }
                  })()}
                </p>
              </div>
            )}
            <div>
              <Label className="text-gray-600">Statut</Label>
              <div className="mt-1">{getStatusBadge(declaration.statut)}</div>
            </div>
            {declaration.user && typeof declaration.user === 'object' && (
              <div>
                <Label className="text-gray-600">Déclarant</Label>
                <p className="font-medium">
                  {declaration.user.firstName} {declaration.user.lastName}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informations de l'enfant */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Informations de l'Enfant</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-600">Prénom(s)</Label>
              <p className="font-medium">{declaration.prenomEnfant}</p>
            </div>
            <div>
              <Label className="text-gray-600">Nom</Label>
              <p className="font-medium">{declaration.nomEnfant}</p>
            </div>
            <div>
              <Label className="text-gray-600">Sexe</Label>
              <p className="font-medium">{declaration.sexe === 'M' ? 'Masculin' : 'Féminin'}</p>
            </div>
            <div>
              <Label className="text-gray-600">Date de naissance</Label>
              <p className="font-medium">
                {(() => {
                  try {
                    if (!declaration.dateNaissance) return 'N/A';
                    const date = new Date(declaration.dateNaissance);
                    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('fr-FR');
                  } catch {
                    return 'N/A';
                  }
                })()}
                {declaration.heureNaissance && ` à ${declaration.heureNaissance}`}
              </p>
            </div>
            <div className="col-span-2">
              <Label className="text-gray-600">Lieu de naissance</Label>
              <p className="font-medium">{declaration.lieuNaissance}</p>
            </div>
          </CardContent>
        </Card>

        {/* Informations des parents */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Informations des Parents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Père */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Père</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Prénom(s)</Label>
                  <p className="font-medium">{declaration.prenomPere || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Nom</Label>
                  <p className="font-medium">{declaration.nomPere}</p>
                </div>
                {declaration.professionPere && (
                  <div>
                    <Label className="text-gray-600">Profession</Label>
                    <p className="font-medium">{declaration.professionPere}</p>
                  </div>
                )}
                {declaration.nationalitePere && (
                  <div>
                    <Label className="text-gray-600">Nationalité</Label>
                    <p className="font-medium">{declaration.nationalitePere}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Mère */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Mère</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Prénom(s)</Label>
                  <p className="font-medium">{declaration.prenomMere || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Nom</Label>
                  <p className="font-medium">{declaration.nomMere}</p>
                </div>
                {declaration.nomJeuneFilleMere && (
                  <div>
                    <Label className="text-gray-600">Nom de jeune fille</Label>
                    <p className="font-medium">{declaration.nomJeuneFilleMere}</p>
                  </div>
                )}
                {declaration.professionMere && (
                  <div>
                    <Label className="text-gray-600">Profession</Label>
                    <p className="font-medium">{declaration.professionMere}</p>
                  </div>
                )}
                {declaration.nationaliteMere && (
                  <div>
                    <Label className="text-gray-600">Nationalité</Label>
                    <p className="font-medium">{declaration.nationaliteMere}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents joints par le parent */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ImageIcon className="h-5 w-5" />
              <span>Documents joints par le parent</span>
            </CardTitle>
            <CardDescription>
              Photos et documents envoyés avec la déclaration
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(() => {
              try {
                // Vérifier si les documents existent et sont un tableau
                const docs = declaration.documents;
                if (!docs || !Array.isArray(docs) || docs.length === 0) {
                  return (
                    <div className="text-center py-8 text-gray-500">
                      <p>Aucun document joint à cette déclaration</p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {docs.map((doc: any, index: number) => {
                      try {
                        // Construire l'URL du document - peut être un chemin relatif ou une URL complète
                        const docUrl = doc?.url || doc?.path || doc?.fichier?.url || doc?.fichier?.path;
                        const docName = doc?.nom || doc?.name || doc?.filename || `Document ${index + 1}`;
                        const docType = doc?.typeDocument || doc?.type || 'Document';
                        
                        // Construire l'URL complète du fichier
                        const fullUrl = getFileUrl(docUrl);
                        
                        return (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-sm">{docName}</span>
                              {fullUrl && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  asChild
                                >
                                  <a 
                                    href={fullUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center space-x-1"
                                  >
                                    <FileText className="h-4 w-4" />
                                    <span>Voir</span>
                                  </a>
                                </Button>
                              )}
                            </div>
                            {fullUrl && (fullUrl.match(/\.(jpg|jpeg|png|gif)$/i) || docType?.match(/image|photo/i)) && (
                              <div className="mt-2">
                                <img 
                                  src={fullUrl} 
                                  alt={docName}
                                  className="w-full h-48 object-cover rounded border cursor-pointer hover:opacity-80"
                                  onClick={() => window.open(fullUrl, '_blank')}
                                  onError={(e) => {
                                    // En cas d'erreur de chargement, masquer l'image
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    // Afficher un message d'erreur dans la console uniquement en développement
                                    if (process.env.NODE_ENV === 'development') {
                                      console.warn(`Impossible de charger l'image: ${fullUrl}`);
                                    }
                                  }}
                                />
                              </div>
                            )}
                            <p className="text-xs text-gray-500 mt-2">
                              Type: {docType}
                            </p>
                          </div>
                        );
                      } catch (docError) {
                        // En cas d'erreur lors du traitement d'un document, afficher un message
                        return (
                          <div key={index} className="border rounded-lg p-4 border-red-200 bg-red-50">
                            <p className="text-sm text-red-600">Erreur lors du chargement du document</p>
                          </div>
                        );
                      }
                    })}
                  </div>
                );
              } catch (error) {
                return (
                  <div className="text-center py-8 text-red-500">
                    <p>Erreur lors du chargement des documents</p>
                  </div>
                );
              }
            })()}
          </CardContent>
        </Card>

        {/* Informations du certificat d'accouchement */}
        {declaration.certificatAccouchement && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Certificat d'Accouchement</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-600">Numéro</Label>
                <p className="font-medium">{declaration.certificatAccouchement.numero}</p>
              </div>
              <div>
                <Label className="text-gray-600">Date de délivrance</Label>
                <p className="font-medium">
                  {(() => {
                    try {
                      const dateDeliv = (declaration.certificatAccouchement as any)?.dateDelivrance;
                      if (!dateDeliv) return 'N/A';
                      const date = new Date(dateDeliv);
                      return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('fr-FR');
                    } catch {
                      return 'N/A';
                    }
                  })()}
                </p>
              </div>
              {(declaration.certificatAccouchement as any).fichier && (declaration.certificatAccouchement as any).fichier.url && (
                <div className="col-span-2">
                  <Label className="text-gray-600">Fichier du certificat</Label>
                  <div className="mt-2">
                    <Button variant="outline" size="sm" asChild>
                      <a 
                        href={(declaration.certificatAccouchement as any).fichier.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Voir le certificat
                      </a>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>

      {/* Dialog Envoyer à l'hôpital */}
      <Dialog open={sendToHospitalDialogOpen} onOpenChange={setSendToHospitalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Envoyer à l'hôpital pour vérification</DialogTitle>
            <DialogDescription>
              Sélectionnez l'hôpital à qui envoyer la demande de vérification du certificat d'accouchement
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hospital">Hôpital *</Label>
              <Select 
                value={selectedHospital}
                onValueChange={setSelectedHospital}
                disabled={loadingHospitals}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingHospitals ? "Chargement..." : "Sélectionner l'hôpital"} />
                </SelectTrigger>
                <SelectContent>
                  {suggestedHospitals.map((hopital) => (
                    <SelectItem key={hopital._id} value={hopital._id}>
                      {hopital.nom} ({hopital.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {suggestedHospitals.length === 0 && !loadingHospitals && (
                <p className="text-sm text-gray-500">Aucun hôpital suggéré disponible</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setSendToHospitalDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button 
              className="text-white"
              style={{ backgroundColor: "#00853F" }}
              onClick={handleSendToHospital}
              disabled={loadingAction || !selectedHospital || loadingHospitals}
            >
              {loadingAction ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Envoyer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Rejet */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter la demande</DialogTitle>
            <DialogDescription>
              Précisez le motif du rejet. Le parent sera notifié.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="reason">Motif du rejet *</Label>
            <Textarea
              id="reason"
              placeholder="Ex: Documents incomplets, informations manquantes..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setRejectDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button 
              variant="destructive"
              onClick={handleReject}
              disabled={loadingAction}
            >
              {loadingAction ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejet...
                </>
              ) : (
                "Confirmer le rejet"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Génération Acte */}
      <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Générer l'Acte de Naissance</DialogTitle>
            <DialogDescription>
              L'acte de naissance sera généré avec toutes les informations de la déclaration. Le timbre et le cachet numérique seront générés automatiquement.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Informations qui seront incluses dans l'acte :</h4>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Informations de l'enfant : {declaration?.prenomEnfant} {declaration?.nomEnfant}</li>
                <li>Date et heure de naissance : {(() => {
                  try {
                    if (!declaration?.dateNaissance) return 'N/A';
                    const date = new Date(declaration.dateNaissance);
                    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('fr-FR');
                  } catch {
                    return 'N/A';
                  }
                })()} à {declaration?.heureNaissance || 'N/A'}</li>
                <li>Lieu de naissance : {declaration?.lieuNaissance || 'N/A'}</li>
                <li>Sexe : {declaration?.sexe === 'M' ? 'Masculin' : 'Féminin'}</li>
                <li>Père : {declaration?.prenomPere || ''} {declaration?.nomPere || ''}</li>
                <li>Mère : {declaration?.prenomMere || ''} {declaration?.nomMere || ''}</li>
                <li>Timbre et cachet numérique (générés automatiquement)</li>
                <li>Numéro d'acte et numéro de registre (générés automatiquement)</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>Note :</strong> Le timbre et le cachet numérique seront générés automatiquement par le système. 
                L'acte de naissance contiendra toutes les informations de la déclaration validée.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setGenerateDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button 
              className="text-white"
              style={{ backgroundColor: "#00853F" }}
              onClick={handleGenerateCertificate}
              disabled={loadingAction}
            >
              {loadingAction ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Générer l'Acte
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation pour validation */}
      <Dialog open={validateConfirmDialogOpen} onOpenChange={setValidateConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la validation</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir valider cette déclaration ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setValidateConfirmDialogOpen(false)}
              disabled={loadingAction}
            >
              Annuler
            </Button>
            <Button 
              className="text-white"
              style={{ backgroundColor: "#00853F" }}
              onClick={confirmValidate}
              disabled={loadingAction}
            >
              {loadingAction ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Validation...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirmer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation pour archivage */}
      <Dialog open={archiveConfirmDialogOpen} onOpenChange={setArchiveConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer l'archivage</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir archiver ce dossier ? Le parent pourra alors télécharger l'acte de naissance.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setArchiveConfirmDialogOpen(false)}
              disabled={loadingAction}
            >
              Annuler
            </Button>
            <Button 
              variant="outline"
              onClick={confirmArchive}
              disabled={loadingAction}
            >
              {loadingAction ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Archivage...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Confirmer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
