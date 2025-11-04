import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { authService } from "@/services/authService";

export default function Login() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<"parent" | "mairie" | "hopital">("parent");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!identifier || !password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setLoading(true);

    try {
      // Utilisation du service d'authentification
      const response = await authService.login(identifier, password);
      
      // Stocker le token JWT et les informations utilisateur dans le localStorage
      if (response.token && response.user) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        // Vérifier si l'utilisateur est vérifié
        if (!response.user.isVerified) {
          toast.error("Veuillez vérifier votre email avant de vous connecter");
          return;
        }
        
        // Récupérer le rôle depuis la réponse
        const userRole = response.user.role || 'parent';
        
        toast.success("Connexion réussie !");
        console.log('Utilisateur connecté:', response.user);
        
        // Rediriger en fonction du rôle de l'utilisateur
        if (userRole === 'parent') {
          navigate('/dashboard');
        } else if (userRole === 'mairie') {
          navigate('/mairie/dashboard');
        } else if (userRole === 'hopital') {
          navigate('/hopital/dashboard');
        } else {
          // Redirection par défaut si le rôle n'est pas reconnu
          navigate('/dashboard');
        }
      } else {
        throw new Error("Aucun token reçu");
      }
    } catch (error: any) {
      console.error('Erreur de connexion complète:', error);
      
      let errorMessage = "Erreur de connexion. Veuillez réessayer.";
      
      if (error.response) {
        // Erreur avec réponse du serveur
        console.error('Détails de l\'erreur:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
        
        if (error.response.status === 401) {
          errorMessage = "Email ou mot de passe incorrect.";
        } else if (error.response.status === 403) {
          errorMessage = error.response.data.message || "Veuvez vérifier votre email avant de vous connecter.";
          if (error.response.data.requiresVerification) {
            // Rediriger vers la page de vérification si nécessaire
            navigate(`/verify-otp?userId=${error.response.data.userId}`);
          }
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        // La requête a été faite mais aucune réponse n'a été reçue
        console.error('Aucune réponse du serveur:', error.request);
        errorMessage = "Le serveur ne répond pas. Veuillez réessayer plus tard.";
      } else {
        // Erreur lors de la configuration de la requête
        console.error('Erreur de configuration de la requête:', error.message);
        errorMessage = "Erreur de configuration. Veuillez réessayer.";
      }
      
      toast.error(errorMessage);
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
              <Button 
                type="submit" 
                className="w-full text-white font-semibold"
                style={{ backgroundColor: "#00853F" }}
                disabled={loading}
              >
                {loading ? "Connexion en cours..." : "Se connecter"}
              </Button>
              
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
                <p className="text-sm text-gray-500 mt-4">
                  Les comptes Mairie et Hôpital sont créés par l'administrateur.
                </p>
              )}
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
