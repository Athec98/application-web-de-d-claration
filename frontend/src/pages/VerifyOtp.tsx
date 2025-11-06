import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import { ROLES, ROLE_REDIRECTS } from "@/config/roles";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [userId, setUserId] = useState("");
  const [otpError, setOtpError] = useState<string>("");

  // Extraire l'ID utilisateur du localStorage
  useEffect(() => {
    // Essayer de récupérer depuis le localStorage
    const id = localStorage.getItem('tempUserId');
    
    console.log('Tentative de récupération de l\'ID utilisateur...');
    console.log('ID trouvé dans le localStorage:', id);
    
    if (!id) {
      console.error('Aucun ID utilisateur trouvé dans le localStorage');
      toast.error("Session expirée ou invalide. Veuillez vous réinscrire.");
      navigate("/register");
      return;
    }
    
    console.log('ID utilisateur défini:', id);
    setUserId(id);
    
    // Ne pas nettoyer le localStorage ici pour éviter la perte de l'ID
    // lors des re-rendus
  }, [navigate]);
  
  // Nettoyer le localStorage uniquement après une vérification réussie
  // ou lors du démontage du composant si l'utilisateur quitte la page

  // Gestion du compte à rebours
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Empêcher la validation HTML5
    
    // Réinitialiser l'erreur
    setOtpError("");
    
    if (!otp || otp.trim() === "") {
      setOtpError("Le code de vérification est obligatoire");
      toast.error("Veuillez entrer le code de vérification");
      return;
    }
    
    if (otp.length !== 6) {
      setOtpError("Le code de vérification doit contenir exactement 6 chiffres");
      toast.error("Veuillez entrer un code OTP valide (6 chiffres)");
      return;
    }
    
    if (!/^\d{6}$/.test(otp)) {
      setOtpError("Le code de vérification ne doit contenir que des chiffres");
      toast.error("Le code de vérification ne doit contenir que des chiffres");
      return;
    }

    if (!userId) {
      console.error('Aucun ID utilisateur disponible pour la vérification');
      toast.error("Erreur de session. Veuillez réessayer de vous inscrire.");
      navigate("/register");
      return;
    }

    setLoading(true);
    console.log('Début de la vérification OTP...');
    console.log('ID utilisateur:', userId);
    console.log('Code OTP saisi:', otp);

    try {
      console.log('Appel de authService.verifyOTP...');
      const response = await authService.verifyOTP(userId, otp);
      console.log('Réponse du serveur:', response);
      
      if (!response.success) {
        throw new Error(response.message || 'Échec de la vérification OTP');
      }
      
      // Nettoyer le stockage temporaire
      localStorage.removeItem('tempUserId');
      
      // Stocker le token et les infos utilisateur
      if (response.token && response.user) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        // Déterminer le rôle de l'utilisateur (par défaut 'parent')
        const userRole = (response.user.role as keyof typeof ROLE_REDIRECTS) || ROLES.PARENT;
        console.log('Utilisateur vérifié avec le rôle:', userRole);
        
        // Obtenir l'URL de redirection en fonction du rôle
        const redirectPath = ROLE_REDIRECTS[userRole] || ROLE_REDIRECTS[ROLES.PARENT];
        
        console.log(`Redirection vers ${redirectPath}`);
        toast.success("Votre compte a été vérifié avec succès !");
        
        // Rediriger vers le tableau de bord approprié
        navigate(redirectPath);
      } else {
        // Si pas de token ou d'utilisateur, rediriger vers la page de connexion
        console.log('Données utilisateur manquantes dans la réponse, redirection vers /login');
        navigate('/login');
      }
      
    } catch (error: any) {
      console.error('Erreur complète:', error);
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         "Erreur lors de la vérification du code";
      
      console.error('Message d\'erreur à afficher:', errorMessage);
      toast.error(errorMessage);
      
      // En cas d'erreur spécifique (comme un OTP invalide), on ne supprime pas l'ID
      // pour permettre une nouvelle tentative
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0 || !userId) return;

    setResendLoading(true);

    try {
      // Implémentez cette fonction dans votre authService
      await authService.resendOtp(userId);
      setCountdown(60);
      toast.success("Un nouveau code a été envoyé");
    } catch (error) {
      console.error('Erreur renvoi OTP:', error);
      toast.error("Erreur lors de l'envoi du code");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-yellow-50 py-8">
      <div className="w-full max-w-md p-4">
        <div className="text-center mb-8">
          <img 
            src="/armoiries-senegal.png" 
            alt="Armoiries du Sénégal" 
            className="h-20 mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold mb-2" style={{ color: "#006B32" }}>
            Vérification du compte
          </h1>
          <p className="text-gray-600">
            Entrez le code à 6 chiffres envoyé
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Vérification OTP</CardTitle>
            <CardDescription>
              Code envoyé à l'utilisateur ID: {userId.substring(0, 8)}...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Code de vérification *</Label>
                <Input
                  id="otp"
                  name="otp"
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setOtp(value);
                    // Validation en temps réel
                    if (value.length > 0 && value.length !== 6) {
                      setOtpError("Le code de vérification doit contenir exactement 6 chiffres");
                    } else if (value.length === 6 && !/^\d{6}$/.test(value)) {
                      setOtpError("Le code de vérification ne doit contenir que des chiffres");
                    } else {
                      setOtpError("");
                    }
                  }}
                  onBlur={(e) => {
                    const value = e.target.value;
                    if (!value.trim()) {
                      setOtpError("Le code de vérification est obligatoire");
                    } else if (value.length !== 6) {
                      setOtpError("Le code de vérification doit contenir exactement 6 chiffres");
                    } else if (!/^\d{6}$/.test(value)) {
                      setOtpError("Le code de vérification ne doit contenir que des chiffres");
                    }
                  }}
                  inputMode="numeric"
                  autoFocus
                />
                {otpError ? (
                  <p className="text-sm text-red-600 mt-1">{otpError}</p>
                ) : (
                  <p className="text-xs text-gray-500">
                    Entrez le code à 6 chiffres reçu par email
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full text-white font-semibold"
                style={{ backgroundColor: "#00853F" }}
                disabled={loading}
              >
                {loading ? "Vérification..." : "Vérifier le code"}
              </Button>

              <div className="text-center text-sm text-gray-600 mt-4">
                Pas de code ?{" "}
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={countdown > 0 || resendLoading}
                  className={`font-medium ${
                    countdown > 0 ? 'text-gray-400' : 'text-green-600 hover:underline'
                  }`}
                >
                  {resendLoading 
                    ? "Envoi en cours..." 
                    : countdown > 0 
                      ? `Renvoyer (${countdown}s)` 
                      : "Renvoyer le code"}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}