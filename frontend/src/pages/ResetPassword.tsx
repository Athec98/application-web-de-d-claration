import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { authService } from "@/services/authService";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});

  useEffect(() => {
    const resetToken = searchParams.get('token');
    if (!resetToken) {
      toast.error("Token de réinitialisation manquant. Veuillez utiliser le lien reçu par email.");
      navigate('/forgot-password');
    } else {
      setToken(resetToken);
    }
  }, [searchParams, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Empêcher la validation HTML5

    if (!token) {
      toast.error("Token de réinitialisation manquant");
      return;
    }

    // Réinitialiser les erreurs
    const newErrors: { password?: string; confirmPassword?: string } = {};
    const errorMessages: string[] = [];

    if (!password.trim()) {
      newErrors.password = "Le mot de passe est obligatoire";
      errorMessages.push("Le mot de passe est obligatoire");
    } else if (password.length < 6) {
      newErrors.password = "Le mot de passe doit contenir au moins 6 caractères";
      errorMessages.push("Le mot de passe doit contenir au moins 6 caractères");
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "La confirmation du mot de passe est obligatoire";
      errorMessages.push("La confirmation du mot de passe est obligatoire");
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
      errorMessages.push("Les mots de passe ne correspondent pas");
    }

    // Afficher les erreurs
    setErrors(newErrors);
    if (errorMessages.length > 0) {
      toast.error(`Veuillez corriger les erreurs suivantes : ${errorMessages.join(", ")}`);
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword(token, password);
      toast.success("Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.");
      // Rediriger vers la page de login après 2 secondes
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Erreur lors de la réinitialisation du mot de passe";
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
            CIVILE-APP
          </h1>
          <p className="text-gray-600">
            Réinitialisation du mot de passe
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/login')}
                className="mr-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle>Nouveau mot de passe</CardTitle>
                <CardDescription>
                  Entrez votre nouveau mot de passe
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nouveau mot de passe *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
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
                    className="pl-10 pr-10"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password ? (
                  <p className="text-sm text-red-600 mt-1">{errors.password}</p>
                ) : (
                  <p className="text-xs text-gray-500">
                    Le mot de passe doit contenir au moins 6 caractères
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => {
                      const value = e.target.value;
                      setConfirmPassword(value);
                      // Validation en temps réel
                      if (value.trim() && value !== password) {
                        setErrors({ ...errors, confirmPassword: 'Les mots de passe ne correspondent pas' });
                      } else {
                        setErrors({ ...errors, confirmPassword: undefined });
                      }
                    }}
                    onBlur={(e) => {
                      const value = e.target.value;
                      if (!value.trim()) {
                        setErrors({ ...errors, confirmPassword: 'La confirmation du mot de passe est obligatoire' });
                      } else if (value !== password) {
                        setErrors({ ...errors, confirmPassword: 'Les mots de passe ne correspondent pas' });
                      }
                    }}
                    className="pl-10 pr-10"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full text-white"
                style={{ backgroundColor: "#00853F" }}
                disabled={loading || !token}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Réinitialisation en cours...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Réinitialiser le mot de passe
                  </>
                )}
              </Button>

              <div className="text-center text-sm text-gray-600 mt-4">
                <Button 
                  type="button" 
                  variant="link" 
                  className="text-green-600 hover:text-green-700"
                  onClick={() => navigate('/login')}
                >
                  Retour à la connexion
                </Button>
              </div>
            </form>
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

