import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { FileText, LogOut, Loader2 } from "lucide-react";
import { toast } from "sonner";
import NotificationsPanel from "@/components/NotificationsPanel";
import { declarationService, type Declaration } from "@/services/declarationService";

export default function HopitalDashboard() {
  const [, setLocation] = useLocation();
  const [verificationRequests, setVerificationRequests] = useState<Declaration[]>([]);
  const [allDeclarations, setAllDeclarations] = useState<Declaration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVerificationRequests();
  }, []);

  const loadVerificationRequests = async () => {
    try {
      setLoading(true);
      const data = await declarationService.getVerificationRequests();
      setVerificationRequests(data);
      
      // Charger aussi toutes les déclarations traitées par l'hôpital pour les statistiques
      const allDeclarations = await declarationService.getAllHospitalDeclarations();
      setAllDeclarations(allDeclarations);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Erreur lors du chargement des demandes de vérification";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  const handleLogout = () => {
    // Nettoyer le localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tempUserId');
    
    // Rediriger immédiatement vers la page de connexion avec un rechargement complet
    // Utiliser replace() pour éviter que l'utilisateur puisse revenir en arrière
    window.location.replace('/login');
  };



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src="/armoiries-senegal.png" 
                alt="Armoiries" 
                className="h-12"
              />
              <div>
                <h1 className="text-xl font-bold text-senegal-green-dark">
                  CIVILE-APP
                </h1>
                <p className="text-sm text-gray-600">Espace Hôpital</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <NotificationsPanel />
              <Button 
                variant="ghost" 
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Tableau de Bord Hôpital</h2>
          <p className="text-gray-600">
            Vérifiez l'authenticité des certificats d'accouchement
          </p>
        </div>

        {/* Statistics Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Demandes en attente</CardDescription>
              <CardTitle className="text-3xl">{verificationRequests.length}</CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Validées</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {allDeclarations.filter(d => 
                  d.statut === 'certificat_valide' || 
                  (d.certificatAccouchement?.authentique === true && d.statut !== 'en_verification_hopital')
                ).length}
              </CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Rejetées</CardDescription>
              <CardTitle className="text-3xl text-red-600">
                {allDeclarations.filter(d => 
                  d.statut === 'certificat_rejete' || 
                  (d.certificatAccouchement?.authentique === false && d.statut !== 'en_verification_hopital')
                ).length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Verification Requests Table */}
        <Card>
          <CardHeader>
            <CardTitle>Demandes de Vérification</CardTitle>
            <CardDescription>
              Certificats d'accouchement à vérifier
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-senegal-green" />
              </div>
            ) : verificationRequests.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom de l'enfant</TableHead>
                    <TableHead>Parent</TableHead>
                    <TableHead>Date de naissance</TableHead>
                    <TableHead>Date de demande</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {verificationRequests.map((request) => (
                    <TableRow key={request._id}>
                      <TableCell className="font-medium">
                        {request.prenomEnfant} {request.nomEnfant}
                      </TableCell>
                      <TableCell>
                        {typeof request.user === 'object' && request.user 
                          ? `${request.user.firstName || ''} ${request.user.lastName || ''}`.trim()
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {(() => {
                          try {
                            if (!request.dateNaissance) return 'N/A';
                            const date = new Date(request.dateNaissance);
                            return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('fr-FR');
                          } catch {
                            return 'N/A';
                          }
                        })()}
                      </TableCell>
                      <TableCell>
                        {(() => {
                          try {
                            if (!request.createdAt) return 'N/A';
                            const date = new Date(request.createdAt);
                            return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('fr-FR');
                          } catch {
                            return 'N/A';
                          }
                        })()}
                      </TableCell>
                      <TableCell>
                        {request.documents && request.documents.length > 0 ? (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            {request.documents.length} document{request.documents.length > 1 ? 's' : ''}
                          </Badge>
                        ) : (
                          <span className="text-gray-400 text-sm">Aucun</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              window.location.href = `/hopital/verification/${request._id}`;
                            }}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Consulter et Vérifier
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-gray-500 py-8">
                Aucune demande de vérification en attente
              </p>
            )}
          </CardContent>
        </Card>
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
