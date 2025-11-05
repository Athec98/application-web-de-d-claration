import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, FileText, Download, Calendar, User, MapPin } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const getStatusBadge = (status: string) => {
  const statusConfig = {
    en_cours: { label: "En cours", variant: "secondary" as const, className: "" },
    en_attente: { label: "En attente", variant: "default" as const, className: "" },
    valide: { label: "Validé", variant: "default" as const, className: "bg-green-600" },
    rejete: { label: "Rejeté", variant: "destructive" as const, className: "" },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.en_cours;
  
  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
};

export default function ParentDeclarationDetail() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [declaration, setDeclaration] = useState<any>(null);

  useEffect(() => {
    const loadDeclaration = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error("Vous devez être connecté");
          window.location.href = '/login';
          return;
        }

        // TODO: Remplacer par l'appel API réel
        // const response = await axios.get(`/api/declarations/${id}`, {
        //   headers: { 'Authorization': `Bearer ${token}` }
        // });
        
        // Données simulées pour l'instant
        await new Promise(resolve => setTimeout(resolve, 500));
        setDeclaration({
          id: id,
          nomEnfant: "Fatou Diop",
          prenomEnfant: "Fatou",
          dateNaissance: "2024-10-20",
          heureNaissance: "14:30",
          lieuNaissance: "Hôpital Principal de Dakar",
          sexe: "F",
          poids: 3.2,
          taille: 50,
          nomPere: "Mamadou",
          prenomPere: "Mamadou",
          professionPere: "Ingénieur",
          nationalitePere: "Sénégalaise",
          nomMere: "Aminata",
          prenomMere: "Aminata",
          nomJeuneFilleMere: "Ndiaye",
          professionMere: "Enseignante",
          nationaliteMere: "Sénégalaise",
          statut: "valide",
          dateDeclaration: "2024-10-20",
          numeroActe: "SN-2024-001234",
          documents: [
            { nom: "Certificat d'accouchement", url: "#", typeDocument: "certificat_accouchement" },
            { nom: "CNI Père", url: "#", typeDocument: "id_pere" },
            { nom: "CNI Mère", url: "#", typeDocument: "id_mere" },
          ]
        });
      } catch (error: any) {
        console.error('Erreur chargement déclaration:', error);
        toast.error("Erreur lors du chargement de la déclaration");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadDeclaration();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-senegal-green mx-auto mb-4"></div>
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
          <Button onClick={() => { window.location.href = '/dashboard'; }}>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => {
                  window.location.href = '/dashboard';
                }}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold" style={{ color: "#006B32" }}>
                  Détails de la Déclaration
                </h1>
                <p className="text-sm text-gray-600">
                  Numéro: {declaration.numeroActe || `#${id}`}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusBadge(declaration.statut)}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Informations sur l'enfant */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" style={{ color: "#00853F" }} />
              <span>Informations sur l'Enfant</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nom complet</p>
                <p className="font-semibold">{declaration.nomEnfant} {declaration.prenomEnfant}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Sexe</p>
                <p className="font-semibold">{declaration.sexe === 'M' ? 'Masculin' : 'Féminin'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date de naissance</p>
                <p className="font-semibold flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(declaration.dateNaissance).toLocaleDateString('fr-FR')}</span>
                  {declaration.heureNaissance && (
                    <span className="text-gray-500">à {declaration.heureNaissance}</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Lieu de naissance</p>
                <p className="font-semibold flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>{declaration.lieuNaissance}</span>
                </p>
              </div>
              {declaration.poids && (
                <div>
                  <p className="text-sm text-gray-600">Poids</p>
                  <p className="font-semibold">{declaration.poids} kg</p>
                </div>
              )}
              {declaration.taille && (
                <div>
                  <p className="text-sm text-gray-600">Taille</p>
                  <p className="font-semibold">{declaration.taille} cm</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Informations sur les parents */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" style={{ color: "#00853F" }} />
              <span>Informations sur les Parents</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Père */}
            <div>
              <h3 className="font-semibold mb-3 text-senegal-green-dark">Père</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Nom complet</p>
                  <p className="font-semibold">{declaration.nomPere} {declaration.prenomPere || ''}</p>
                </div>
                {declaration.professionPere && (
                  <div>
                    <p className="text-sm text-gray-600">Profession</p>
                    <p className="font-semibold">{declaration.professionPere}</p>
                  </div>
                )}
                {declaration.nationalitePere && (
                  <div>
                    <p className="text-sm text-gray-600">Nationalité</p>
                    <p className="font-semibold">{declaration.nationalitePere}</p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Mère */}
            <div>
              <h3 className="font-semibold mb-3 text-senegal-green-dark">Mère</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Nom complet</p>
                  <p className="font-semibold">{declaration.nomMere} {declaration.prenomMere || ''}</p>
                </div>
                {declaration.nomJeuneFilleMere && (
                  <div>
                    <p className="text-sm text-gray-600">Nom de jeune fille</p>
                    <p className="font-semibold">{declaration.nomJeuneFilleMere}</p>
                  </div>
                )}
                {declaration.professionMere && (
                  <div>
                    <p className="text-sm text-gray-600">Profession</p>
                    <p className="font-semibold">{declaration.professionMere}</p>
                  </div>
                )}
                {declaration.nationaliteMere && (
                  <div>
                    <p className="text-sm text-gray-600">Nationalité</p>
                    <p className="font-semibold">{declaration.nationaliteMere}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        {declaration.documents && declaration.documents.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" style={{ color: "#00853F" }} />
                <span>Documents joints</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {declaration.documents.map((doc: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-gray-600" />
                      <span className="font-medium">{doc.nom}</span>
                    </div>
                    <Button variant="outline" size="sm">
                      Voir
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Informations de la déclaration */}
        <Card>
          <CardHeader>
            <CardTitle>Informations de la Déclaration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Date de déclaration</p>
                <p className="font-semibold">
                  {new Date(declaration.dateDeclaration).toLocaleDateString('fr-FR')}
                </p>
              </div>
              {declaration.numeroActe && (
                <div>
                  <p className="text-sm text-gray-600">Numéro d'acte</p>
                  <p className="font-semibold">{declaration.numeroActe}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        {declaration.statut === 'valide' && (
          <div className="mt-6 flex justify-end">
            <Button 
              className="text-white"
              style={{ backgroundColor: "#00853F" }}
              onClick={() => {
                window.location.href = `/payment?type=certificate&declarationId=${id}`;
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Télécharger l'acte de naissance (250 F)
            </Button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-600">
          <p>République du Sénégal</p>
          <p className="font-semibold">Un Peuple - Un But - Une Foi</p>
        </div>
      </footer>
    </div>
  );
}


