import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
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

export default function MairieDeclarationDetail() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/mairie/declaration/:id");
  const declarationId = params?.id;
  
  const [declaration, setDeclaration] = useState<Declaration | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [sendToHospitalDialogOpen, setSendToHospitalDialogOpen] = useState(false);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
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

  // Charger la déclaration
  useEffect(() => {
    if (declarationId) {
      loadDeclaration();
    }
  }, [declarationId]);

  // Charger les hôpitaux suggérés quand la déclaration est chargée
  useEffect(() => {
    if (declaration && sendToHospitalDialogOpen) {
      loadSuggestedHospitals();
    }
  }, [declaration, sendToHospitalDialogOpen]);

  const loadDeclaration = async () => {
    if (!declarationId) return;
    
    try {
      setLoading(true);
      const data = await declarationService.getDeclarationById(declarationId);
      setDeclaration(data);
    } catch (error: any) {
      console.error("Erreur lors du chargement:", error);
      toast.error("Erreur lors du chargement de la déclaration");
    } finally {
      setLoading(false);
    }
  };

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
      console.error("Erreur lors du chargement des hôpitaux:", error);
      toast.error("Erreur lors du chargement des hôpitaux");
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
      console.error("Erreur lors de l'envoi:", error);
      toast.error(error.response?.data?.message || "Erreur lors de l'envoi");
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
      await loadDeclaration(); // Recharger pour mettre à jour le statut
    } catch (error: any) {
      console.error("Erreur lors du rejet:", error);
      toast.error(error.response?.data?.message || "Erreur lors du rejet");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleGenerateCertificate = async () => {
    if (!certificateData.timbreFile || !certificateData.cachetFile) {
      toast.error("Veuillez ajouter le timbre et le cachet numériques");
      return;
    }

    if (!declarationId) return;

    setLoadingAction(true);
    try {
      // Convertir les fichiers en URLs (base64 ou upload)
      // Pour l'instant, on va utiliser des URLs temporaires
      // TODO: Implémenter l'upload des fichiers
      const timbreUrl = URL.createObjectURL(certificateData.timbreFile);
      const cachetUrl = URL.createObjectURL(certificateData.cachetFile);

      // Récupérer l'ID de l'utilisateur connecté depuis localStorage
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const officierEtatCivilId = user?._id || user?.id;

      if (!officierEtatCivilId) {
        toast.error("Erreur: Utilisateur non connecté");
        return;
      }

      await acteNaissanceService.generateActeNaissance(declarationId);
      
      toast.success("Acte de naissance généré avec succès !");
      setGenerateDialogOpen(false);
      await loadDeclaration(); // Recharger pour mettre à jour le statut
      
      // Nettoyer les URLs temporaires
      URL.revokeObjectURL(timbreUrl);
      URL.revokeObjectURL(cachetUrl);
    } catch (error: any) {
      console.error("Erreur lors de la génération:", error);
      toast.error(error.response?.data?.message || "Erreur lors de la génération");
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
  const canGenerateActe = declaration.statut === 'certificat_valide';
  const hasHospitalResponse = declaration.statut === 'certificat_valide' || declaration.statut === 'certificat_rejete';

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
                  Soumise le {new Date(declaration.createdAt).toLocaleDateString('fr-FR')}
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
                      Vérifié le {new Date((declaration.certificatAccouchement as any).dateVerification).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>

                {canGenerateActe && (
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
                {new Date(declaration.dateNaissance).toLocaleDateString('fr-FR')}
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
                  {new Date(declaration.certificatAccouchement.dateDelivrance).toLocaleDateString('fr-FR')}
                </p>
              </div>
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
              Ajoutez le timbre et le cachet numériques pour générer l'acte de naissance
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="stamp">Timbre numérique *</Label>
              <Input
                id="stamp"
                type="file"
                accept="image/*"
                onChange={(e) => setCertificateData({
                  ...certificateData, 
                  timbreFile: e.target.files?.[0] || null
                })}
              />
              {certificateData.timbreFile && (
                <p className="text-sm text-green-600">✓ Timbre ajouté</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cachet">Cachet numérique *</Label>
              <Input
                id="cachet"
                type="file"
                accept="image/*"
                onChange={(e) => setCertificateData({
                  ...certificateData, 
                  cachetFile: e.target.files?.[0] || null
                })}
              />
              {certificateData.cachetFile && (
                <p className="text-sm text-green-600">✓ Cachet ajouté</p>
              )}
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
                "Générer et Valider"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
