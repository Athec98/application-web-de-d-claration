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
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle,
  Download,
  Image as ImageIcon,
  AlertCircle,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { declarationService, type Declaration } from "@/services/declarationService";
import { getFileUrl } from "@/utils/fileUtils";

export default function HopitalVerificationDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const declarationId = id;
  
  const [declaration, setDeclaration] = useState<Declaration | null>(null);
  const [loading, setLoading] = useState(true);
  const [validateDialogOpen, setValidateDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [validationComment, setValidationComment] = useState("");
  const [loadingAction, setLoadingAction] = useState(false);

  useEffect(() => {
    const loadDeclaration = async () => {
      if (!declarationId) {
        console.error('ID de déclaration manquant dans l\'URL');
        toast.error("ID de déclaration manquant dans l'URL");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        console.log('Chargement de la déclaration avec ID:', declarationId);
        const data = await declarationService.getDeclarationById(declarationId);
        setDeclaration(data);
      } catch (error: any) {
        console.error("Erreur lors du chargement:", error);
        toast.error("Erreur lors du chargement de la déclaration");
      } finally {
        setLoading(false);
      }
    };

    loadDeclaration();
  }, [declarationId]);

  const handleValidate = async () => {
    if (!declarationId) return;

    setLoadingAction(true);
    try {
      await declarationService.verifyCertificate(declarationId, true, validationComment);
      toast.success("Certificat validé. La mairie a été notifiée.");
      setValidateDialogOpen(false);
      navigate("/hopital/dashboard");
    } catch (error: any) {
      console.error("Erreur lors de la validation:", error);
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
      await declarationService.verifyCertificate(declarationId, false, rejectionReason);
      toast.success("Certificat rejeté. La mairie et le parent ont été notifiés.");
      setRejectDialogOpen(false);
      navigate("/hopital/dashboard");
    } catch (error: any) {
      console.error("Erreur lors du rejet:", error);
      toast.error(error.response?.data?.message || "Erreur lors du rejet");
    } finally {
      setLoadingAction(false);
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      certificat_accouchement: "Certificat d'accouchement",
      id_pere: "Pièce d'identité du père",
      id_mere: "Pièce d'identité de la mère",
      autre: "Autre document",
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-senegal-green mx-auto mb-4" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!declaration) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Déclaration non trouvée</p>
          <Button onClick={() => { navigate("/hopital/dashboard"); }}>
            Retour au tableau de bord
          </Button>
        </div>
      </div>
    );
  }

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
                navigate("/hopital/dashboard");
              }}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold" style={{ color: "#006B32" }}>
                Vérification du Certificat d'Accouchement
              </h1>
              <p className="text-sm text-gray-600">
                Demande de vérification #{declaration._id?.slice(-8)}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Alerte et Actions */}
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardHeader>
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-6 w-6 text-yellow-600 mt-1" />
              <div className="flex-1">
                <CardTitle className="text-yellow-900">Vérification requise</CardTitle>
                <CardDescription className="text-yellow-700">
                  La mairie demande la vérification de l'authenticité 
                  du certificat d'accouchement pour cette naissance.
                </CardDescription>
                <p className="text-sm text-yellow-600 mt-2">
                  Demande reçue le {(() => {
                    try {
                      if (!declaration.createdAt) return 'N/A';
                      const date = new Date(declaration.createdAt);
                      return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('fr-FR');
                    } catch {
                      return 'N/A';
                    }
                  })()}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <Button
                className="text-white"
                style={{ backgroundColor: "#00853F" }}
                onClick={() => setValidateDialogOpen(true)}
                disabled={loadingAction}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Valider l'authenticité
              </Button>
              <Button
                variant="destructive"
                onClick={() => setRejectDialogOpen(true)}
                disabled={loadingAction}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Certificat non conforme
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Informations de l'enfant */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Informations de l'Enfant Né</CardTitle>
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
              <Label className="text-gray-600">Date et heure de naissance</Label>
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
              <Label className="text-gray-600">Lieu de naissance déclaré</Label>
              <p className="font-medium">{declaration.lieuNaissance}</p>
              <Badge className="mt-2 bg-blue-600">
                Vérifiez que cette naissance a bien eu lieu dans votre établissement
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Informations des parents */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Informations des Parents Déclarants</CardTitle>
            <CardDescription>
              Vérifiez la correspondance avec le certificat d'accouchement
            </CardDescription>
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
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents à vérifier */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Documents Fournis</CardTitle>
            <CardDescription>
              Consultez les documents pour vérifier l'authenticité
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
                      <p>Aucun document disponible</p>
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
                          <div 
                            key={index}
                            className={`border rounded-lg p-4 ${
                              doc.typeDocument === 'certificat_accouchement' ? 'border-yellow-300 bg-yellow-50' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <ImageIcon className="h-5 w-5 text-gray-400" />
                                <div>
                                  <p className="font-medium text-sm">{docName}</p>
                                  <p className="text-xs text-gray-500">{getDocumentTypeLabel(docType || 'autre')}</p>
                                  {doc.typeDocument === 'certificat_accouchement' && (
                                    <Badge className="mt-1 bg-yellow-600 text-xs">Document principal à vérifier</Badge>
                                  )}
                                </div>
                              </div>
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
                            {fullUrl && (
                              <div className="mt-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full"
                                  onClick={() => window.open(fullUrl, '_blank')}
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Consulter
                                </Button>
                              </div>
                            )}
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

        {/* Points de vérification */}
        <Card>
          <CardHeader>
            <CardTitle>Points de Vérification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="mt-1 h-5 w-5 rounded-full border-2 border-gray-300" />
                <div>
                  <p className="font-medium">Le certificat d'accouchement a-t-il été délivré par votre établissement ?</p>
                  <p className="text-sm text-gray-600">Vérifiez le numéro de certificat et la signature</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="mt-1 h-5 w-5 rounded-full border-2 border-gray-300" />
                <div>
                  <p className="font-medium">Les informations correspondent-elles à vos registres ?</p>
                  <p className="text-sm text-gray-600">Date, heure, nom de la mère, sexe de l'enfant</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="mt-1 h-5 w-5 rounded-full border-2 border-gray-300" />
                <div>
                  <p className="font-medium">La personne déclarante est-elle bien la mère ou le père légitime ?</p>
                  <p className="text-sm text-gray-600">Vérifiez les pièces d'identité fournies</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="mt-1 h-5 w-5 rounded-full border-2 border-gray-300" />
                <div>
                  <p className="font-medium">Le certificat est-il authentique et non falsifié ?</p>
                  <p className="text-sm text-gray-600">Vérifiez les tampons, signatures et éléments de sécurité</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Dialog Validation */}
      <Dialog open={validateDialogOpen} onOpenChange={setValidateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer l'authenticité</DialogTitle>
            <DialogDescription>
              Vous confirmez que le certificat d'accouchement est authentique et que toutes les informations sont conformes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="comment">Commentaire (optionnel)</Label>
            <Textarea
              id="comment"
              placeholder="Ajoutez un commentaire si nécessaire..."
              value={validationComment}
              onChange={(e) => setValidationComment(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setValidateDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button 
              className="text-white"
              style={{ backgroundColor: "#00853F" }}
              onClick={handleValidate}
              disabled={loadingAction}
            >
              {loadingAction ? "Validation..." : "Confirmer l'authenticité"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Rejet */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Certificat non conforme</DialogTitle>
            <DialogDescription>
              Précisez le motif du rejet. La mairie et le parent seront notifiés.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="reason">Motif du rejet *</Label>
            <Textarea
              id="reason"
              placeholder="Ex: Certificat non délivré par notre établissement, informations non conformes, document falsifié..."
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
              {loadingAction ? "Rejet..." : "Confirmer le rejet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
