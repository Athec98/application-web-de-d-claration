import { useState } from "react";
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
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle,
  Download,
  Image as ImageIcon,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

// Données simulées
const mockVerificationRequest = {
  id: 1,
  // Informations enfant
  childFirstName: "Mamadou",
  childLastName: "Sall",
  childGender: "masculin",
  birthDate: "2024-10-20T14:30:00",
  birthPlace: "Hôpital Principal de Dakar",
  
  // Informations parents
  fatherFirstName: "Ousmane",
  fatherLastName: "Sall",
  fatherIdNumber: "1234567890123",
  motherFirstName: "Awa",
  motherLastName: "Diop",
  motherIdNumber: "9876543210987",
  residenceAddress: "Parcelles Assainies, Dakar",
  
  // Métadonnées
  parentName: "Awa Sall",
  parentPhone: "+221 77 123 45 67",
  parentEmail: "awa.sall@example.com",
  submittedDate: "2024-10-26T10:00:00",
  requestDate: "2024-10-27T09:00:00",
  mairieRequester: "Mairie de Dakar",
  
  // Documents
  documents: [
    { id: 1, type: "certificat_accouchement", name: "certificat_accouchement.pdf", url: "#" },
    { id: 2, type: "id_pere", name: "cni_pere.jpg", url: "#" },
    { id: 3, type: "id_mere", name: "cni_mere.jpg", url: "#" },
  ],
};

export default function HopitalVerificationDetail() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/hopital/verification/:id");
  const verificationId = params?.id ?? String(mockVerificationRequest.id);
  
  const [validateDialogOpen, setValidateDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [validationComment, setValidationComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleValidate = async () => {
    setLoading(true);
    try {
      // TODO: Implémenter l'API
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Certificat validé. La mairie a été notifiée.");
      setValidateDialogOpen(false);
      setLocation("/hopital/dashboard");
    } catch (error) {
      toast.error("Erreur lors de la validation");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Veuillez préciser le motif du rejet");
      return;
    }

    setLoading(true);
    try {
      // TODO: Implémenter l'API
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Certificat rejeté. La mairie et le parent ont été notifiés.");
      setRejectDialogOpen(false);
      setLocation("/hopital/dashboard");
    } catch (error) {
      toast.error("Erreur lors du rejet");
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation("/hopital/dashboard")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
                <div>
                  <h1 className="text-xl font-bold" style={{ color: "#006B32" }}>
                  Vérification du Certificat d'Accouchement
                </h1>
                <p className="text-sm text-gray-600">
                  Demande de vérification #{verificationId}
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
                  La {mockVerificationRequest.mairieRequester} demande la vérification de l'authenticité 
                  du certificat d'accouchement pour cette naissance.
                </CardDescription>
                <p className="text-sm text-yellow-600 mt-2">
                  Demande reçue le {new Date(mockVerificationRequest.requestDate).toLocaleDateString('fr-FR')}
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
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Valider l'authenticité
              </Button>
              <Button
                variant="destructive"
                onClick={() => setRejectDialogOpen(true)}
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
              <p className="font-medium">{mockVerificationRequest.childFirstName}</p>
            </div>
            <div>
              <Label className="text-gray-600">Nom</Label>
              <p className="font-medium">{mockVerificationRequest.childLastName}</p>
            </div>
            <div>
              <Label className="text-gray-600">Sexe</Label>
              <p className="font-medium capitalize">{mockVerificationRequest.childGender}</p>
            </div>
            <div>
              <Label className="text-gray-600">Date et heure de naissance</Label>
              <p className="font-medium">
                {new Date(mockVerificationRequest.birthDate).toLocaleString('fr-FR')}
              </p>
            </div>
            <div className="col-span-2">
              <Label className="text-gray-600">Lieu de naissance déclaré</Label>
              <p className="font-medium">{mockVerificationRequest.birthPlace}</p>
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
                  <p className="font-medium">{mockVerificationRequest.fatherFirstName}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Nom</Label>
                  <p className="font-medium">{mockVerificationRequest.fatherLastName}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-gray-600">Numéro d'identité</Label>
                  <p className="font-medium">{mockVerificationRequest.fatherIdNumber}</p>
                </div>
              </div>
            </div>

            {/* Mère */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Mère</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Prénom(s)</Label>
                  <p className="font-medium">{mockVerificationRequest.motherFirstName}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Nom</Label>
                  <p className="font-medium">{mockVerificationRequest.motherLastName}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-gray-600">Numéro d'identité</Label>
                  <p className="font-medium">{mockVerificationRequest.motherIdNumber}</p>
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
            <div className="space-y-3">
              {mockVerificationRequest.documents.map((doc) => (
                <div 
                  key={doc.id}
                  className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 ${
                    doc.type === 'certificat_accouchement' ? 'border-yellow-300 bg-yellow-50' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <ImageIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{getDocumentTypeLabel(doc.type)}</p>
                      <p className="text-sm text-gray-500">{doc.name}</p>
                      {doc.type === 'certificat_accouchement' && (
                        <Badge className="mt-1 bg-yellow-600">Document principal à vérifier</Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(doc.url, '_blank')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Consulter
                  </Button>
                </div>
              ))}
            </div>
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
              disabled={loading}
            >
              {loading ? "Validation..." : "Confirmer l'authenticité"}
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
              disabled={loading}
            >
              {loading ? "Rejet..." : "Confirmer le rejet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
