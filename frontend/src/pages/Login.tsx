import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import { ROLES, ROLE_REDIRECTS } from "@/config/roles";

export default function Login() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<"parent" | "mairie" | "hopital">("parent");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation des champs
    if (!identifier || !password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setLoading(true);

    try {
      console.log('Tentative de connexion avec:', { identifier });
      
      // Appel au service d'authentification
      const response = await authService.login(identifier, password);
      
      // Vérifier la réponse de connexion
      if (response.token && response.user) {
        // Stocker le token et les informations utilisateur
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        // Récupérer le rôle depuis la réponse
        const userRole = response.user.role as keyof typeof ROLE_REDIRECTS || ROLES.PARENT;
        
        toast.success("Connexion réussie !");
        console.log('Utilisateur connecté:', response.user);
        
        // Obtenir l'URL de redirection en fonction du rôle
        const redirectPath = ROLE_REDIRECTS[userRole] || ROLE_REDIRECTS[ROLES.PARENT];
        console.log(`Redirection vers ${redirectPath} pour le rôle ${userRole}`);
        
        // Utiliser navigate pour la redirection
        navigate(redirectPath, { replace: true });
      } else {
        throw new Error("Réponse de connexion invalide");
      }
    } catch (error: any) {
      console.error('Erreur de connexion complète:', error);
      
      // Gestion des erreurs
      if (error.requiresVerification) {
        // Rediriger vers la page de vérification OTP si nécessaire
        const userId = error.userId || '';
        console.log('Redirection vers la page de vérification OTP pour l\'utilisateur:', userId);
        navigate(`/verify-otp?userId=${userId}`, { replace: true });
      } else {
        // Afficher le message d'erreur à l'utilisateur
        const errorMessage = error.message || "Erreur de connexion. Veuillez réessayer.";
        console.error('Erreur de connexion:', errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-yellow-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img 
            src="/armoiries-senegal.png" 
            alt="Armoiries du Sénégal" 
            className="h-24 mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold mb-2" style={{ color: "#006B32" }}>
            État Civil Sénégal
          </h1>
          <p className="text-gray-600">
            Système de déclaration de naissance en ligne
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Connexion</CardTitle>
            <CardDescription>
              Connectez-vous à votre espace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Sélection du type d'utilisateur */}
              <div className="space-y-2">
                <Label htmlFor="userType">Type de profil</Label>
                <Select value={userType} onValueChange={(value: any) => setUserType(value)}>
                  <SelectTrigger id="userType">
                    <SelectValue placeholder="Sélectionnez votre profil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="parent">Parent</SelectItem>
                    <SelectItem value="mairie">Mairie</SelectItem>
                    <SelectItem value="hopital">Hôpital</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Champ identifiant */}
              <div className="space-y-2">
                <Label htmlFor="identifier">
                  Email *
                </Label>
                <Input
                  id="identifier"
                  type="email"
                  placeholder="exemple@email.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </div>

              {/* Champ mot de passe */}
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* Bouton de connexion - BIEN VISIBLE */}
              <div className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full text-white font-semibold py-2"
                  style={{ 
                    backgroundColor: "#00853F",
                    height: '44px',
                    fontSize: '1rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1
                  }}
                  disabled={loading}
                >
                  {loading ? "Connexion en cours..." : "Se connecter"}
                </Button>
              </div>
              
              <div className="text-center text-sm text-gray-600 mt-4">
                <Button 
                  type="button" 
                  variant="link" 
                  className="text-green-600 hover:text-green-700"
                  onClick={() => navigate('/register')}
                >
                  S'inscrire
                </Button>
              </div>
            </form>

            <div className="mt-4 text-center space-y-2">
              {userType === "parent" && (
                <>
                  <Button 
                    variant="link" 
                    className="text-sm"
                    style={{ color: "#00853F" }}
                    onClick={() => toast.info("Fonctionnalité à venir")}
                  >
                    Mot de passe oublié ?
                  </Button>
                  <div className="text-sm text-gray-600">
                    Pas encore de compte ?{" "}
                    <Button 
                      variant="link" 
                      className="p-0 font-semibold"
                      style={{ color: "#00853F" }}
                      onClick={() => navigate("/register")}
                    >
                      S'inscrire
                    </Button>
                  </div>
                </>
              )}
              
              {(userType === "mairie" || userType === "hopital") && (
                <p className="text-sm text-gray-500 mt-4"></p>
              )
              }
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>République du Sénégal</p>
          <p className="font-semibold">Un Peuple - Un But - Une Foi</p>
        </div>
      </div>
    </div>
  );
}
