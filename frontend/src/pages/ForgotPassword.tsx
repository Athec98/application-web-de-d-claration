import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { authService } from "@/services/authService";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Empêcher la validation HTML5

    // Réinitialiser l'erreur
    setEmailError("");

    // Validations
    const errors: string[] = [];

    if (!email.trim()) {
      setEmailError("L'adresse email est obligatoire");
      errors.push("L'adresse email est obligatoire");
    } else {
      // Validation du format email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setEmailError("L'adresse email n'est pas valide");
        errors.push("L'adresse email n'est pas valide");
      }
    }

    // Afficher les erreurs
    if (errors.length > 0) {
      toast.error(`Veuillez corriger les erreurs suivantes : ${errors.join(", ")}`);
      return;
    }

    setLoading(true);

    try {
      await authService.forgotPassword(email.trim());
      toast.success("Un email de réinitialisation a été envoyé à votre adresse email. Veuillez vérifier votre boîte de réception.");
      // Optionnel : rediriger vers la page de login après 3 secondes
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Erreur lors de l'envoi de l'email de réinitialisation";
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
                <CardTitle>Mot de passe oublié</CardTitle>
                <CardDescription>
                  Entrez votre adresse email pour recevoir un lien de réinitialisation
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Adresse email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="exemple@email.com"
                    value={email}
                    onChange={(e) => {
                      const value = e.target.value;
                      setEmail(value);
                      // Validation en temps réel
                      if (value.trim()) {
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (!emailRegex.test(value.trim())) {
                          setEmailError("L'adresse email n'est pas valide");
                        } else {
                          setEmailError("");
                        }
                      } else {
                        setEmailError("");
                      }
                    }}
                    onBlur={(e) => {
                      const value = e.target.value;
                      if (!value.trim()) {
                        setEmailError("L'adresse email est obligatoire");
                      } else {
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (!emailRegex.test(value.trim())) {
                          setEmailError("L'adresse email n'est pas valide");
                        }
                      }
                    }}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
                {emailError ? (
                  <p className="text-sm text-red-600 mt-1">{emailError}</p>
                ) : (
                  <p className="text-xs text-gray-500">
                    Un lien de réinitialisation sera envoyé à cette adresse email
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full text-white"
                style={{ backgroundColor: "#00853F" }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Envoyer le lien de réinitialisation
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

