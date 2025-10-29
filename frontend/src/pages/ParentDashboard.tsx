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
    childName: "Fatou Diop",
    documentType: "Acte de naissance",
    available: true,
  },
];

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

export default function ParentDashboard() {
  const [, setLocation] = useLocation();
  const [notifications] = useState(2);

  const handleLogout = () => {
    toast.success("Déconnexion réussie");
    setLocation("/login");
  };

  const handleDownload = (childName: string) => {
    toast.info(`Redirection vers le paiement pour télécharger l'acte de ${childName}`);
    // TODO: Implémenter le flux de paiement
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
              <Button 
                variant="ghost" 
                size="icon"
                className="relative"
                onClick={() => toast.info("Notifications à venir")}
              >
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-senegal-red text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </Button>
              <Button 
                variant="ghost"
                onClick={() => setLocation("/profile")}
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
          <h2 className="text-2xl font-bold mb-2">Bienvenue sur votre tableau de bord</h2>
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
                onClick={() => setLocation("/new-declaration")}
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
                          onClick={() => toast.info("Détails de la déclaration")}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Voir
                        </Button>
                        {declaration.status === "rejete" && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setLocation(`/edit-declaration/${declaration.id}`)}
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
                          onClick={() => handleDownload(cert.childName)}
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
