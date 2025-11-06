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
import { Plus, FileText, Download, Bell, LogOut, User, Edit, Loader2 } from "lucide-react";
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

export default function ParentDashboard() {
  const [, setLocation] = useLocation();
  const [declarations, setDeclarations] = useState<Declaration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDeclarations();
  }, []);

  const loadDeclarations = async () => {
    try {
      setLoading(true);
      
      // Vérifier que l'utilisateur est connecté
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      const user = localStorage.getItem('user');
      
      if (!token) {
        toast.error("Vous devez être connecté");
        window.location.href = '/login';
        return;
      }

      const data = await declarationService.getMyDeclarations();
      
      // Normaliser les déclarations - s'assurer que chaque déclaration a un _id
      const normalizedDeclarations = data.map((d: any) => {
        // Si pas de _id mais un id, utiliser id comme _id
        if (!d._id && d.id) {
          return { ...d, _id: d.id };
        }
        // Si l'_id est un objet, le convertir en string
        if (d._id && typeof d._id === 'object' && d._id.toString) {
          return { ...d, _id: d._id.toString() };
        }
        // Si _id existe déjà, garder tel quel
        return d;
      });
      
      // Vérifier que chaque déclaration a un _id après normalisation
      const validDeclarations = normalizedDeclarations.filter(d => d._id);
      
      setDeclarations(validDeclarations);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Erreur lors du chargement des déclarations";
      
      if (error.response?.status === 403) {
        toast.error("Vous n'avez pas les permissions pour accéder à cette ressource");
      } else if (error.response?.status === 401) {
        toast.error("Session expirée. Veuillez vous reconnecter");
        window.location.href = '/login';
      } else {
        toast.error(errorMessage);
      }
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

  const handleDownload = async (declaration: Declaration) => {
    console.log('Tentative de téléchargement pour déclaration:', declaration);
    
    // Vérifier que le statut permet le téléchargement
    const canDownload = declaration.statut === 'validee' || 
                       declaration.statut === 'archivee' || 
                       declaration.statut === 'valide' ||
                       (declaration.statut === 'certificat_valide' && declaration.acteNaissance);
    
    if (!canDownload) {
      toast.error("Le dossier doit être validé avant de pouvoir télécharger l'acte de naissance");
      return;
    }

    if (declaration.acteNaissance) {
      console.log('Redirection vers paiement avec acteId:', declaration.acteNaissance);
      window.location.href = `/payment?acteId=${declaration.acteNaissance}`;
    } else {
      toast.error("L'acte de naissance n'est pas encore disponible. Veuillez patienter que la mairie génère l'acte.");
    }
  };

  const handleView = (declarationId: string | undefined) => {
    if (!declarationId) {
      toast.error("Erreur: ID de déclaration manquant");
      return;
    }
    window.location.href = `/declaration/${declarationId}`;
  };

  // Filtrer les déclarations avec acte de naissance généré
  // Déclarations avec acte de naissance disponible (validées ou archivées)
  const declarationsWithActe = declarations.filter(d => 
    d.acteNaissance && (d.statut === 'validee' || d.statut === 'archivee' || d.statut === 'valide' || d.statut === 'certificat_valide')
  );

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
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-senegal-green" />
              </div>
            ) : declarations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="mb-4">Aucune déclaration trouvée.</p>
                <p className="text-sm">Créez votre première déclaration de naissance.</p>
              </div>
            ) : (
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
                  {declarations.map((declaration) => (
                    <TableRow key={declaration._id}>
                      <TableCell className="font-medium">
                        {declaration.prenomEnfant} {declaration.nomEnfant}
                      </TableCell>
                      <TableCell>
                        {(() => {
                          try {
                            if (!declaration.createdAt) return 'N/A';
                            const date = new Date(declaration.createdAt);
                            return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('fr-FR');
                          } catch {
                            return 'N/A';
                          }
                        })()}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(declaration.statut)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              console.log('Clic sur Voir pour déclaration:', declaration);
                              handleView(declaration._id);
                            }}
                            disabled={!declaration._id}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Voir
                          </Button>
                          {/* Bouton de téléchargement pour les déclarations validées avec acte */}
                          {(() => {
                            const isValidee = declaration.statut === 'validee' || 
                                             declaration.statut === 'archivee' || 
                                             declaration.statut === 'valide' ||
                                             declaration.statut === 'certificat_valide';
                            const hasActe = !!declaration.acteNaissance;
                            
                            // Log pour débogage - afficher pour TOUTES les déclarations validées
                            if (isValidee) {
                              console.log('🔍 Déclaration validée:', {
                                id: declaration._id,
                                statut: declaration.statut,
                                hasActe: hasActe,
                                acteNaissance: declaration.acteNaissance,
                                enfant: `${declaration.prenomEnfant} ${declaration.nomEnfant}`,
                                canShowButton: isValidee && hasActe
                              });
                            }
                            
                            // Afficher le bouton si validée ET acte existe
                            if (isValidee && hasActe) {
                              return (
                                <Button 
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white font-semibold"
                                  onClick={() => handleDownload(declaration)}
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Télécharger
                                </Button>
                              );
                            }
                            
                            // Afficher un message si validée mais pas d'acte
                            if (isValidee && !hasActe) {
                              return (
                                <span className="text-xs text-gray-500 italic">
                                  Acte en génération...
                                </span>
                              );
                            }
                            
                            return null;
                          })()}
                          {/* Bouton modifier pour les déclarations en cours seulement */}
                          {(() => {
                            // Seulement les statuts "en_attente", "en_cours_mairie" ou "en_cours" peuvent être modifiés
                            const canEdit = declaration.statut === "en_attente" || 
                                           declaration.statut === "en_cours_mairie" || 
                                           declaration.statut === "en_cours";
                            
                            if (canEdit) {
                              return (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    window.location.href = `/edit-declaration/${declaration._id}`;
                                  }}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Modifier
                                </Button>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Documents Section - Afficher pour toutes les déclarations validées */}
        {(() => {
          const declarationsValidees = declarations.filter(d => {
            const isValidStatus = d.statut === 'validee' || 
                                 d.statut === 'archivee' || 
                                 d.statut === 'valide' || 
                                 d.statut === 'certificat_valide';
            return isValidStatus;
          });
          
          const declarationsAvecActe = declarationsValidees.filter(d => !!d.acteNaissance);
          const declarationsSansActe = declarationsValidees.filter(d => !d.acteNaissance);
          
          console.log('📋 Section Documents:', {
            totalValidees: declarationsValidees.length,
            avecActe: declarationsAvecActe.length,
            sansActe: declarationsSansActe.length,
            details: declarationsValidees.map(d => ({
              id: d._id,
              statut: d.statut,
              acteNaissance: d.acteNaissance,
              enfant: `${d.prenomEnfant} ${d.nomEnfant}`
            }))
          });
          
          if (declarationsValidees.length === 0) {
            return null; // Ne pas afficher la section si aucune déclaration validée
          }
          
          return (
            <Card>
              <CardHeader>
                <CardTitle>Mes Documents Disponibles</CardTitle>
                <CardDescription>
                  Téléchargez vos actes de naissance (250 F par téléchargement)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {declarationsAvecActe.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom de l'enfant</TableHead>
                        <TableHead>Type de document</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {declarationsAvecActe.map((declaration) => (
                        <TableRow key={declaration._id}>
                          <TableCell className="font-medium">
                            {declaration.prenomEnfant} {declaration.nomEnfant}
                          </TableCell>
                          <TableCell>Acte de naissance</TableCell>
                          <TableCell>
                            <Badge className="bg-green-600 text-white">
                              Disponible
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white font-semibold"
                              onClick={() => handleDownload(declaration)}
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
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-2">Aucun acte de naissance disponible pour le moment</p>
                    <p className="text-sm text-gray-500">
                      Vos déclarations validées sont en attente de génération de l'acte par la mairie.
                    </p>
                  </div>
                )}
                
                {declarationsSansActe.length > 0 && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 font-semibold mb-2">
                      Actes en cours de génération ({declarationsSansActe.length})
                    </p>
                    <ul className="text-xs text-yellow-700 space-y-1">
                      {declarationsSansActe.map((d) => (
                        <li key={d._id}>
                          • {d.prenomEnfant} {d.nomEnfant} - Statut: {d.statut}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })()}
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
