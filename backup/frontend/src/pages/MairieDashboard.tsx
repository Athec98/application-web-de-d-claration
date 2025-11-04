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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, LogOut, Filter } from "lucide-react";
import { toast } from "sonner";

// Données simulées
const mockDeclarations = [
  {
    id: 1,
    childName: "Fatou Diop",
    parentName: "Moussa Diop",
    submittedDate: "2024-10-27",
    status: "en_cours",
  },
  {
    id: 2,
    childName: "Mamadou Sall",
    parentName: "Awa Sall",
    submittedDate: "2024-10-26",
    status: "en_attente",
  },
  {
    id: 3,
    childName: "Aminata Ndiaye",
    parentName: "Omar Ndiaye",
    submittedDate: "2024-10-25",
    status: "en_cours",
  },
  {
    id: 4,
    childName: "Ibrahima Fall",
    parentName: "Khady Fall",
    submittedDate: "2024-10-24",
    status: "valide",
  },
];

const getStatusBadge = (status: string) => {
  const statusConfig = {
    en_cours: { label: "En cours", variant: "secondary" as const, className: "" },
    en_attente: { label: "En attente", variant: "default" as const, className: "bg-yellow-600" },
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

export default function MairieDashboard() {
  const [, setLocation] = useLocation();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const handleLogout = () => {
    toast.success("Déconnexion réussie");
    setLocation("/login");
  };

  const filteredDeclarations = statusFilter === "all" 
    ? mockDeclarations 
    : mockDeclarations.filter(d => d.status === statusFilter);

  const stats = {
    total: mockDeclarations.length,
    enCours: mockDeclarations.filter(d => d.status === "en_cours").length,
    enAttente: mockDeclarations.filter(d => d.status === "en_attente").length,
    valide: mockDeclarations.filter(d => d.status === "valide").length,
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
                <p className="text-sm text-gray-600">Espace Mairie</p>
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
          <h2 className="text-2xl font-bold mb-2">Tableau de Bord Mairie</h2>
          <p className="text-gray-600">
            Gérez les déclarations de naissance et validez les dossiers
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total des déclarations</CardDescription>
              <CardTitle className="text-3xl">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>En cours</CardDescription>
              <CardTitle className="text-3xl text-gray-600">{stats.enCours}</CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>En attente</CardDescription>
              <CardTitle className="text-3xl text-yellow-600">{stats.enAttente}</CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Validées</CardDescription>
              <CardTitle className="text-3xl text-green-600">{stats.valide}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Declarations Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Déclarations de Naissance</CardTitle>
                <CardDescription>
                  Consultez et traitez les demandes de déclaration
                </CardDescription>
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrer par statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="en_cours">En cours</SelectItem>
                    <SelectItem value="en_attente">En attente</SelectItem>
                    <SelectItem value="valide">Validé</SelectItem>
                    <SelectItem value="rejete">Rejeté</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom de l'enfant</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead>Date de soumission</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDeclarations.map((declaration) => (
                  <TableRow key={declaration.id}>
                    <TableCell className="font-medium">
                      {declaration.childName}
                    </TableCell>
                    <TableCell>{declaration.parentName}</TableCell>
                    <TableCell>
                      {new Date(declaration.submittedDate).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(declaration.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setLocation(`/mairie/declaration/${declaration.id}`)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Consulter
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
