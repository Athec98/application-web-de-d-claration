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
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, 
  FileText, 
  Send, 
  XCircle, 
  CheckCircle,
  Download,
  Image as ImageIcon
} from "lucide-react";
import { toast } from "sonner";

// Données simulées
const mockDeclaration = {
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
  status: "en_cours",
  
  // Documents
  documents: [
    { id: 1, type: "certificat_accouchement", name: "certificat_accouchement.pdf", url: "#" },
    { id: 2, type: "id_pere", name: "cni_pere.jpg", url: "#" },
    { id: 3, type: "id_mere", name: "cni_mere.jpg", url: "#" },
  ],
  
  // Réponse hôpital (si existe)
  hospitalResponse: null as { isValid: boolean; comment: string; date: string } | null,
};

export default function MairieDeclarationDetail() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/mairie/declaration/:id");
  const declarationId = params?.id ?? String(mockDeclaration.id);
  
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Données du certificat à générer
  const [certificateData, setCertificateData] = useState({
    certificateNumber: `SN-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    registrationNumber: "",
    registrationDate: new Date().toISOString().split('T')[0],
    officerName: "",
    digitalStamp: null as File | null,
    digitalSignature: null as File | null,
  });

  const handleSendToHospital = async () => {
    setLoading(true);
    try {
      // TODO: Implémenter l'API
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Demande envoyée à l'hôpital pour vérification");
      setLocation("/mairie/dashboard");
    } catch (error) {
      toast.error("Erreur lors de l'envoi");
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
      toast.success("Demande rejetée. Le parent a été notifié.");
      setRejectDialogOpen(false);
      setLocation("/mairie/dashboard");
    } catch (error) {
      toast.error("Erreur lors du rejet");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCertificate = async () => {
    if (!certificateData.registrationNumber || !certificateData.officerName) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (!certificateData.digitalStamp || !certificateData.digitalSignature) {
      toast.error("Veuillez ajouter le timbre et la signature numériques");
      return;
    }

    setLoading(true);
    try {
      // TODO: Implémenter l'API de génération
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success("Acte de naissance généré avec succès !");
      setGenerateDialogOpen(false);
      setLocation("/mairie/dashboard");
    } catch (error) {
      toast.error("Erreur lors de la génération");
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
                onClick={() => setLocation("/mairie/dashboard")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold" style={{ color: "#006B32" }}>
                  Consultation de la Déclaration
                </h1>
                <p className="text-sm text-gray-600">
                  Déclaration #{declarationId}
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
                  Soumise le {new Date(mockDeclaration.submittedDate).toLocaleDateString('fr-FR')}
                </CardDescription>
              </div>
              <Badge className="bg-gray-600">En cours</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {!mockDeclaration.hospitalResponse && (
              <div className="flex space-x-4">
                <Button
                  className="text-white"
                  style={{ backgroundColor: "#00853F" }}
                  onClick={handleSendToHospital}
                  disabled={loading}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Envoyer à l'hôpital
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setRejectDialogOpen(true)}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Rejeter la demande
                </Button>
              </div>
            )}

            {mockDeclaration.hospitalResponse && (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-800">
                      Réponse de l'hôpital reçue
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">
                    {mockDeclaration.hospitalResponse.comment}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Reçu le {new Date(mockDeclaration.hospitalResponse.date).toLocaleDateString('fr-FR')}
                  </p>
                </div>

                {mockDeclaration.hospitalResponse.isValid && (
                  <Button
                    className="text-white"
                    style={{ backgroundColor: "#00853F" }}
                    onClick={() => setGenerateDialogOpen(true)}
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
              <p className="font-medium">{mockDeclaration.childFirstName}</p>
            </div>
            <div>
              <Label className="text-gray-600">Nom</Label>
              <p className="font-medium">{mockDeclaration.childLastName}</p>
            </div>
            <div>
              <Label className="text-gray-600">Sexe</Label>
              <p className="font-medium capitalize">{mockDeclaration.childGender}</p>
            </div>
            <div>
              <Label className="text-gray-600">Date et heure de naissance</Label>
              <p className="font-medium">
                {new Date(mockDeclaration.birthDate).toLocaleString('fr-FR')}
              </p>
            </div>
            <div className="col-span-2">
              <Label className="text-gray-600">Lieu de naissance</Label>
              <p className="font-medium">{mockDeclaration.birthPlace}</p>
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
                  <p className="font-medium">{mockDeclaration.fatherFirstName}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Nom</Label>
                  <p className="font-medium">{mockDeclaration.fatherLastName}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-gray-600">Numéro d'identité</Label>
                  <p className="font-medium">{mockDeclaration.fatherIdNumber}</p>
                </div>
              </div>
            </div>

            {/* Mère */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Mère</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Prénom(s)</Label>
                  <p className="font-medium">{mockDeclaration.motherFirstName}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Nom</Label>
                  <p className="font-medium">{mockDeclaration.motherLastName}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-gray-600">Numéro d'identité</Label>
                  <p className="font-medium">{mockDeclaration.motherIdNumber}</p>
                </div>
              </div>
            </div>

            {/* Adresse */}
            <div>
              <Label className="text-gray-600">Adresse de résidence</Label>
              <p className="font-medium">{mockDeclaration.residenceAddress}</p>
            </div>
          </CardContent>
        </Card>

        {/* Documents justificatifs */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Documents Justificatifs</CardTitle>
            <CardDescription>
              Cliquez sur un document pour le visualiser
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockDeclaration.documents.map((doc) => (
                <div 
                  key={doc.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <ImageIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{getDocumentTypeLabel(doc.type)}</p>
                      <p className="text-sm text-gray-500">{doc.name}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(doc.url, '_blank')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Voir
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Informations du déclarant */}
        <Card>
          <CardHeader>
            <CardTitle>Informations du Déclarant</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-600">Nom complet</Label>
              <p className="font-medium">{mockDeclaration.parentName}</p>
            </div>
            <div>
              <Label className="text-gray-600">Téléphone</Label>
              <p className="font-medium">{mockDeclaration.parentPhone}</p>
            </div>
            <div className="col-span-2">
              <Label className="text-gray-600">Email</Label>
              <p className="font-medium">{mockDeclaration.parentEmail}</p>
            </div>
          </CardContent>
        </Card>
      </main>

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
              disabled={loading}
            >
              {loading ? "Rejet..." : "Confirmer le rejet"}
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
              Remplissez les informations et ajoutez le timbre et la signature numériques
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="certNumber">Numéro d'acte *</Label>
                <Input
                  id="certNumber"
                  value={certificateData.certificateNumber}
                  onChange={(e) => setCertificateData({...certificateData, certificateNumber: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="regNumber">Numéro d'enregistrement *</Label>
                <Input
                  id="regNumber"
                  value={certificateData.registrationNumber}
                  onChange={(e) => setCertificateData({...certificateData, registrationNumber: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="regDate">Date d'enregistrement *</Label>
                <Input
                  id="regDate"
                  type="date"
                  value={certificateData.registrationDate}
                  onChange={(e) => setCertificateData({...certificateData, registrationDate: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="officer">Nom de l'officier *</Label>
                <Input
                  id="officer"
                  value={certificateData.officerName}
                  onChange={(e) => setCertificateData({...certificateData, officerName: e.target.value})}
                  placeholder="Nom complet"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stamp">Timbre numérique *</Label>
              <Input
                id="stamp"
                type="file"
                accept="image/*"
                onChange={(e) => setCertificateData({...certificateData, digitalStamp: e.target.files?.[0] || null})}
              />
              {certificateData.digitalStamp && (
                <p className="text-sm text-green-600">✓ Timbre ajouté</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="signature">Signature numérique *</Label>
              <Input
                id="signature"
                type="file"
                accept="image/*"
                onChange={(e) => setCertificateData({...certificateData, digitalSignature: e.target.files?.[0] || null})}
              />
              {certificateData.digitalSignature && (
                <p className="text-sm text-green-600">✓ Signature ajoutée</p>
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
              disabled={loading}
            >
              {loading ? "Génération..." : "Générer et Valider"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
