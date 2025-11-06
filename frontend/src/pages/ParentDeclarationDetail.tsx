import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, FileText, Download, Calendar, User, MapPin, Edit, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { declarationService, type Declaration } from "@/services/declarationService";
import { getFileUrl } from "@/utils/fileUtils";

const getStatusBadge = (status: string) => {
  const statusConfig: Record<string, { label: string; className: string }> = {
    en_attente: { label: "En attente", className: "bg-yellow-500 text-white" },
    en_cours_mairie: { label: "En cours (Mairie)", className: "bg-blue-500 text-white" },
    en_verification_hopital: { label: "En vérification (Hôpital)", className: "bg-purple-500 text-white" },
    certificat_valide: { label: "Certificat validé", className: "bg-green-500 text-white" },
    certificat_rejete: { label: "Certificat rejeté", className: "bg-red-500 text-white" },
    validee: { label: "Validée", className: "bg-green-600 text-white" },
    rejetee: { label: "Rejetée", className: "bg-red-600 text-white" },
    archivee: { label: "Archivée", className: "bg-gray-500 text-white" },
    // Anciens statuts pour compatibilité
    en_cours: { label: "En cours", className: "bg-blue-500 text-white" },
    valide: { label: "Validé", className: "bg-green-600 text-white" },
    rejete: { label: "Rejeté", className: "bg-red-600 text-white" },
  };

  const config = statusConfig[status] || statusConfig.en_attente;
  
  return (
    <Badge className={config.className}>
      {config.label}
    </Badge>
  );
};

export default function ParentDeclarationDetail() {
  const { id } = useParams<{ id: string }>();
  const declarationId = id;
  const [loading, setLoading] = useState(true);
  const [declaration, setDeclaration] = useState<Declaration | null>(null);

  useEffect(() => {
    const loadDeclaration = async () => {
      if (!declarationId) {
        console.error('ID de déclaration manquant dans l\'URL');
        toast.error("ID de déclaration manquant dans l'URL");
        setLoading(false);
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
        return;
      }

      try {
        const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
        if (!token) {
          toast.error("Vous devez être connecté");
          window.location.href = '/login';
          return;
        }

        console.log('Chargement de la déclaration avec ID:', declarationId);
        // Charger la déclaration depuis l'API
        const data = await declarationService.getDeclarationById(declarationId);
        setDeclaration(data);
      } catch (error: any) {
        console.error('Erreur chargement déclaration:', error);
        toast.error(error.response?.data?.message || "Erreur lors du chargement de la déclaration");
        // Rediriger vers le tableau de bord si erreur
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    loadDeclaration();
  }, [declarationId]);

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
                <h1 className="text-xl font-bold text-senegal-green-dark">
                  Consultation de la Déclaration
                </h1>
                <p className="text-sm text-gray-600">
                  Déclaration #{declaration._id?.slice(-8)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {getStatusBadge(declaration.statut)}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Informations de l'enfant */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" style={{ color: "#00853F" }} />
              <span>Informations de l'Enfant</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Prénom(s)</p>
                <p className="font-semibold">{declaration.prenomEnfant}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Nom</p>
                <p className="font-semibold">{declaration.nomEnfant}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Sexe</p>
                <p className="font-semibold">{declaration.sexe === 'M' ? 'Masculin' : 'Féminin'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date de naissance</p>
                <p className="font-semibold flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>
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
                  </span>
                </p>
              </div>
              <div className="col-span-2">
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

        {/* Documents joints */}
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
                {declaration.documents.map((doc: any, index: number) => {
                  // Construire l'URL du document
                  const docUrl = doc?.url || doc?.path || doc?.fichier?.url || doc?.fichier?.path;
                  const fullUrl = getFileUrl(docUrl);
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span>{doc.nom || doc.name || `Document ${index + 1}`}</span>
                      {fullUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={fullUrl} target="_blank" rel="noopener noreferrer">
                            Voir
                          </a>
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Informations de la déclaration */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Informations de la Déclaration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Date de déclaration</p>
                <p className="font-semibold">
                  {(() => {
                    try {
                      const dateValue = declaration.createdAt || declaration.dateDeclaration;
                      if (!dateValue) return 'N/A';
                      const date = new Date(dateValue);
                      return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('fr-FR');
                    } catch {
                      return 'N/A';
                    }
                  })()}
                </p>
              </div>
              {declaration.acteNaissance && (
                <div>
                  <p className="text-sm text-gray-600">Numéro d'acte</p>
                  <p className="font-semibold">{declaration.acteNaissance}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Motif de rejet si rejetée */}
        {declaration.statut === 'rejetee' && (declaration as any).motifRejet && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800">Motif de rejet</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700 mb-4">{(declaration as any).motifRejet}</p>
              <Button 
                variant="outline"
                onClick={() => {
                  window.location.href = `/edit-declaration/${declaration._id}`;
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Modifier la déclaration
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        {(declaration.statut === 'validee' || declaration.statut === 'archivee') && declaration.acteNaissance && (
          <div className="mt-6 flex justify-end">
            <Button 
              className="text-white"
              style={{ backgroundColor: "#00853F" }}
              onClick={() => {
                window.location.href = `/payment?acteId=${declaration.acteNaissance}`;
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
