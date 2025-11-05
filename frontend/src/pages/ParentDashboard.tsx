import { useState } from "react";
import { useLocation } from "wouter";
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
import { Plus, FileText, Download, Bell, LogOut, User, Edit } from "lucide-react";
import { toast } from "sonner";
import NotificationsPanel from "@/components/NotificationsPanel";

// Données simulées
const mockDeclarations = [
  {
    id: 1,
    childName: "Fatou Diop",
    submittedDate: "2024-10-20",
    status: "valide",
  },
  {
    id: 2,
    childName: "Mamadou Sall",
    submittedDate: "2024-10-25",
    status: "en_attente",
  },
  {
    id: 3,
    childName: "Aminata Ndiaye",
    submittedDate: "2024-10-27",
    status: "en_cours",
  },
];

const mockCertificates = [
  {
    id: 1,
    declarationId: 1,
    childName: "Fatou Diop",
    documentType: "Acte de naissance",
    available: true,
  },
];

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

export default function ParentDashboard() {
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    // Nettoyer le localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tempUserId');
    
    // Rediriger immédiatement vers la page de connexion avec un rechargement complet
    // Utiliser replace() pour éviter que l'utilisateur puisse revenir en arrière
    window.location.replace('/login');
  };

  const handleDownload = (declarationId: number) => {
    window.location.href = `/payment?type=certificate&declarationId=${declarationId}`;
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
                  État Civil Sénégal
                </h1>
                <p className="text-sm text-gray-600">Espace Parent</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <NotificationsPanel />
              <Button 
                variant="ghost"
                onClick={() => {
                  window.location.href = '/profile';
                }}
              >
                <User className="h-4 w-4 mr-2" />
                Mon Profil
              </Button>
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
          <h2 className="text-2xl font-bold mb-2">
            Bienvenue{(() => {
              const user = localStorage.getItem('user');
              if (user) {
                try {
                  const userData = JSON.parse(user);
                  const name = userData.firstName || userData.name || '';
                  return name ? ` ${name}` : '';
                } catch (e) {
                  return '';
                }
              }
              return '';
            })()} sur votre tableau de bord
          </h2>
          <p className="text-gray-600">
            Gérez vos déclarations de naissance et téléchargez vos documents officiels
          </p>
        </div>

        {/* Action Button - Plus visible */}
        <Card className="mb-8 border-2" style={{ borderColor: "#00853F" }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">Déclarer une naissance</h3>
                <p className="text-sm text-gray-600">
                  Soumettez une nouvelle déclaration de naissance à la mairie
                </p>
              </div>
              <Button 
                size="lg"
                className="text-white font-semibold"
                style={{ backgroundColor: "#00853F" }}
                onClick={() => {
                  window.location.href = '/new-declaration';
                }}
              >
                <Plus className="h-5 w-5 mr-2" />
                Nouvelle Déclaration
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Declarations Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Mes Déclarations en Cours</CardTitle>
            <CardDescription>
              Suivez l'état de vos demandes de déclaration de naissance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom de l'enfant</TableHead>
                  <TableHead>Date de soumission</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockDeclarations.map((declaration) => (
                  <TableRow key={declaration.id}>
                    <TableCell className="font-medium">
                      {declaration.childName}
                    </TableCell>
                    <TableCell>
                      {new Date(declaration.submittedDate).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(declaration.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            window.location.href = `/declaration/${declaration.id}`;
                          }}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Voir
                        </Button>
                        {declaration.status === "rejete" && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              window.location.href = `/edit-declaration/${declaration.id}`;
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Documents Section */}
        <Card>
          <CardHeader>
            <CardTitle>Mes Documents Disponibles</CardTitle>
            <CardDescription>
              Téléchargez vos actes de naissance (250 F par téléchargement)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mockCertificates.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom de l'enfant</TableHead>
                    <TableHead>Type de document</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockCertificates.map((cert) => (
                    <TableRow key={cert.id}>
                      <TableCell className="font-medium">
                        {cert.childName}
                      </TableCell>
                      <TableCell>{cert.documentType}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          size="sm"
                          className="bg-senegal-green hover:bg-senegal-green-dark"
                          onClick={() => handleDownload(cert.declarationId || cert.id)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger (250 F)
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-gray-500 py-8">
                Aucun document disponible pour le moment
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
