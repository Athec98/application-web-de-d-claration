import { useState, useEffect } from "react";
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
import { FileText, LogOut, Filter, Loader2 } from "lucide-react";
import { toast } from "sonner";
import NotificationsPanel from "@/components/NotificationsPanel";
import { declarationService, type Declaration } from "@/services/declarationService";

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

export default function MairieDashboard() {
  const [, setLocation] = useLocation();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [declarations, setDeclarations] = useState<Declaration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDeclarations();
  }, []);

  const loadDeclarations = async () => {
    try {
      setLoading(true);
      const data = await declarationService.getDeclarations();
      setDeclarations(data);
    } catch (error: any) {
      console.error("Erreur lors du chargement des déclarations:", error);
      toast.error("Erreur lors du chargement des déclarations");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Nettoyer le localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('tempUserId');
    
    // Rediriger immédiatement vers la page de connexion avec un rechargement complet
    window.location.replace('/login');
  };

  const filteredDeclarations = statusFilter === "all" 
    ? declarations 
    : declarations.filter(d => d.statut === statusFilter);

  const stats = {
    total: declarations.length,
    enCours: declarations.filter(d => d.statut === 'en_cours_mairie' || d.statut === 'en_cours').length,
    enAttente: declarations.filter(d => d.statut === 'en_attente').length,
    valide: declarations.filter(d => d.statut === 'validee' || d.statut === 'valide').length,
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
              <CardTitle className="text-3xl">{stats.enCours}</CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>En attente</CardDescription>
              <CardTitle className="text-3xl">{stats.enAttente}</CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Validées</CardDescription>
              <CardTitle className="text-3xl">{stats.valide}</CardTitle>
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
                  Liste des déclarations reçues
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrer par statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="en_attente">En attente</SelectItem>
                    <SelectItem value="en_cours_mairie">En cours (Mairie)</SelectItem>
                    <SelectItem value="en_verification_hopital">En vérification (Hôpital)</SelectItem>
                    <SelectItem value="certificat_valide">Certificat validé</SelectItem>
                    <SelectItem value="certificat_rejete">Certificat rejeté</SelectItem>
                    <SelectItem value="validee">Validée</SelectItem>
                    <SelectItem value="rejetee">Rejetée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-senegal-green" />
              </div>
            ) : filteredDeclarations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Aucune déclaration trouvée
              </div>
            ) : (
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
                    <TableRow key={declaration._id}>
                      <TableCell className="font-medium">
                        {declaration.prenomEnfant} {declaration.nomEnfant}
                      </TableCell>
                      <TableCell>
                        {typeof declaration.user === 'object' && declaration.user 
                          ? `${declaration.user.firstName || ''} ${declaration.user.lastName || ''}`.trim()
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {new Date(declaration.createdAt).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(declaration.statut)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            window.location.href = `/mairie/declaration/${declaration._id}`;
                          }}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Consulter
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
