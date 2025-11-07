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
  const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({});

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Empêcher la validation HTML5
    
    // Réinitialiser les erreurs
    const newErrors: { identifier?: string; password?: string } = {};

    // Validation de l'identifiant
    if (!identifier.trim()) {
      newErrors.identifier = "L'identifiant (email ou téléphone) est obligatoire";
    } else {
      // Validation du format email ou téléphone
      const isEmail = identifier.includes('@');
      const isPhone = /^(\+221|221)?[0-9]{9}$/.test(identifier.replace(/\s+/g, ''));
      
      if (!isEmail && !isPhone) {
        newErrors.identifier = "L'identifiant doit être un email valide ou un numéro de téléphone sénégalais";
      }
    }
    
    // Validation du mot de passe
    if (!password.trim()) {
      newErrors.password = "Le mot de passe est obligatoire";
    } else if (password.length < 6) {
      newErrors.password = "Le mot de passe doit contenir au moins 6 caractères";
    }

    // Afficher les erreurs
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      // Afficher un toast avec toutes les erreurs
      const errorMessages = Object.values(newErrors).filter(Boolean);
      if (errorMessages.length > 0) {
        toast.error(`Veuillez corriger les erreurs suivantes : ${errorMessages.join(", ")}`);
      }
      return;
    }

    setLoading(true);

    try {
      // Appel au service d'authentification
      const response = await authService.login(identifier, password);
      
      // Vérifier la réponse de connexion
      console.log('📋 Réponse complète de connexion:', response);
      console.log('👤 Données utilisateur:', response.user);
      
      if (response.token && response.user) {
        // Stocker le token et les informations utilisateur
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        // Récupérer le rôle depuis la réponse
        const userRole = (response.user.role?.toLowerCase() || ROLES.PARENT) as keyof typeof ROLE_REDIRECTS;
        console.log('🎭 Rôle détecté:', userRole);
        console.log('📁 Routes disponibles:', ROLE_REDIRECTS);
        
        toast.success("Connexion réussie !");
        
        // Obtenir l'URL de redirection en fonction du rôle
        const redirectPath = ROLE_REDIRECTS[userRole] || ROLE_REDIRECTS[ROLES.PARENT];
        console.log('🔄 Redirection vers:', redirectPath);
        
        // Rediriger vers le tableau de bord approprié
        setTimeout(() => {
          window.location.href = redirectPath;
        }, 500); // Petit délai pour permettre au toast de s'afficher
      } else {
        console.error('❌ Réponse invalide - token ou user manquant:', { 
          hasToken: !!response.token, 
          hasUser: !!response.user,
          response 
        });
        throw new Error("Réponse de connexion invalide");
      }
    } catch (error: any) {
      // Gestion des erreurs
      if (error.requiresVerification) {
        // Rediriger vers la page de vérification OTP si nécessaire
        const userId = error.userId || '';
        window.location.href = `/verify-otp?userId=${userId}`;
      } else {
        // Afficher le message d'erreur à l'utilisateur
        const errorMessage = error.message || "Erreur de connexion. Veuillez réessayer.";
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
            CIVILE-APP
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
                  Email ou Téléphone *
                </Label>
                <Input
                  id="identifier"
                  type="text"
                  placeholder="exemple@email.com ou +221 XX XXX XX XX"
                  value={identifier}
                  onChange={(e) => {
                    const value = e.target.value;
                    setIdentifier(value);
                    // Validation en temps réel
                    if (value.trim()) {
                      const isEmail = value.includes('@');
                      const isPhone = /^(\+221|221)?[0-9]{9}$/.test(value.replace(/\s+/g, ''));
                      if (!isEmail && !isPhone) {
                        setErrors({ ...errors, identifier: 'L\'identifiant doit être un email valide ou un numéro de téléphone sénégalais' });
                      } else {
                        setErrors({ ...errors, identifier: undefined });
                      }
                    } else {
                      setErrors({ ...errors, identifier: undefined });
                    }
                  }}
                  onBlur={(e) => {
                    const value = e.target.value;
                    if (!value.trim()) {
                      setErrors({ ...errors, identifier: 'L\'identifiant (email ou téléphone) est obligatoire' });
                    } else {
                      const isEmail = value.includes('@');
                      const isPhone = /^(\+221|221)?[0-9]{9}$/.test(value.replace(/\s+/g, ''));
                      if (!isEmail && !isPhone) {
                        setErrors({ ...errors, identifier: 'L\'identifiant doit être un email valide ou un numéro de téléphone sénégalais' });
                      }
                    }
                  }}
                />
                {errors.identifier && (
                  <p className="text-sm text-red-600 mt-1">{errors.identifier}</p>
                )}
              </div>

              {/* Champ mot de passe */}
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    const value = e.target.value;
                    setPassword(value);
                    // Validation en temps réel
                    if (value.trim() && value.length < 6) {
                      setErrors({ ...errors, password: 'Le mot de passe doit contenir au moins 6 caractères' });
                    } else {
                      setErrors({ ...errors, password: undefined });
                    }
                  }}
                  onBlur={(e) => {
                    const value = e.target.value;
                    if (!value.trim()) {
                      setErrors({ ...errors, password: 'Le mot de passe est obligatoire' });
                    } else if (value.length < 6) {
                      setErrors({ ...errors, password: 'Le mot de passe doit contenir au moins 6 caractères' });
                    }
                  }}
                />
                {errors.password && (
                  <p className="text-sm text-red-600 mt-1">{errors.password}</p>
                )}
              </div>

              {/* Bouton de connexion - BIEN VISIBLE */}
              <div className="pt-2">
                <button 
                  type="submit" 
                  className="w-full text-white font-semibold py-2 rounded-md"
                  style={{ 
                    backgroundColor: "#00853F",
                    height: '44px',
                    fontSize: '1rem',
                    border: 'none',
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'background-color 0.2s',
                    opacity: loading ? 0.7 : 1,
                    pointerEvents: loading ? 'none' : 'auto'
                  }}
                  disabled={loading}
                >
                  {loading ? "Connexion en cours..." : "Se connecter"}
                </button>
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
                    onClick={() => navigate('/forgot-password')}
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
