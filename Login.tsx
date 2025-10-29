import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function Login() {
  const [, setLocation] = useLocation();
  const [userType, setUserType] = useState<"parent" | "mairie" | "hopital">("parent");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Implémenter la vraie connexion avec l'API
      // Pour l'instant, simulation avec redirection selon le type
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Connexion réussie !");
      
      // Redirection selon le rôle
      if (userType === "parent") {
        setLocation("/dashboard");
      } else if (userType === "mairie") {
        setLocation("/mairie/dashboard");
      } else if (userType === "hopital") {
        setLocation("/hopital/dashboard");
      }
    } catch (error) {
      toast.error("Erreur de connexion. Vérifiez vos identifiants.");
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
                  {userType === "parent" ? "Email ou Numéro de téléphone" : "Email"}
                </Label>
                <Input
                  id="identifier"
                  type={userType === "parent" ? "text" : "email"}
                  placeholder={userType === "parent" ? "exemple@email.com ou +221 XX XXX XX XX" : "exemple@email.com"}
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
                      onClick={() => setLocation("/register")}
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
