import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { FileText, LogOut } from "lucide-react";
import { toast } from "sonner";

// Données simulées
const mockVerificationRequests = [
  {
    id: 1,
    childName: "Mamadou Sall",
    parentName: "Awa Sall",
    birthDate: "2024-10-20",
    requestDate: "2024-10-26",
    certificateUrl: "/sample-certificate.pdf",
  },
  {
    id: 2,
    childName: "Aminata Ndiaye",
    parentName: "Omar Ndiaye",
    birthDate: "2024-10-22",
    requestDate: "2024-10-25",
    certificateUrl: "/sample-certificate.pdf",
  },
];

export default function HopitalDashboard() {
  const [, setLocation] = useLocation();


  const handleLogout = () => {
    toast.success("Déconnexion réussie");
    setLocation("/login");
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
                <p className="text-sm text-gray-600">Espace Hôpital</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
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
              <CardTitle className="text-3xl">{mockVerificationRequests.length}</CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Validées aujourd'hui</CardDescription>
              <CardTitle className="text-3xl text-green-600">0</CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Rejetées aujourd'hui</CardDescription>
              <CardTitle className="text-3xl text-red-600">0</CardTitle>
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
            {mockVerificationRequests.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom de l'enfant</TableHead>
                    <TableHead>Parent</TableHead>
                    <TableHead>Date de naissance</TableHead>
                    <TableHead>Date de demande</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockVerificationRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">
                        {request.childName}
                      </TableCell>
                      <TableCell>{request.parentName}</TableCell>
                      <TableCell>
                        {new Date(request.birthDate).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        {new Date(request.requestDate).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setLocation(`/hopital/verification/${request.id}`)}
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
