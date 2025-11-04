import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { authService } from "@/services/authService";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    name: "",
    phone: "",
    email: "",
    address: "",
    password: "",
    confirmPassword: "",
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    if (!acceptTerms) {
      toast.error("Vous devez accepter les conditions d'utilisation");
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...userData } = formData;
      
      const response = await authService.register({
        ...userData,
        name: `${userData.firstName} ${userData.lastName}`.trim()
      });
      
      // Vérifier la réponse du serveur
      console.log('Réponse du serveur:', response); // Pour le débogage
      
      // Récupérer l'ID utilisateur depuis la réponse
      const userId = response.userId || response.user?._id || response.user?.id;
      
      if (!userId) {
        console.error('ID utilisateur manquant dans la réponse:', response);
        throw new Error("Erreur lors de la création du compte. Veuillez réessayer.");
      }
      
      // Stocker l'ID dans le localStorage
      localStorage.setItem('tempUserId', userId);
      console.log('ID utilisateur stocké:', userId); // Pour le débogage
      
      toast.success("Inscription réussie ! Vérifiez votre email pour le code OTP.");
      navigate('/verify-otp');
    } catch (error: any) {
      console.error('Erreur inscription:', error);
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         "Erreur lors de l'inscription";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
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
            Créer un compte Parent
          </h1>
          <p className="text-gray-600">
            Inscription réservée aux parents uniquement
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Les comptes Mairie et Hôpital sont créés par l'administrateur
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Inscription</CardTitle>
            <CardDescription>
              Remplissez le formulaire pour créer votre compte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom *</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="Prénom"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom *</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Nom"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Numéro de téléphone *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+221 XX XXX XX XX"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Adresse email (optionnel)</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="exemple@email.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Adresse *</Label>
                <Input
                  id="address"
                  name="address"
                  type="text"
                  placeholder="Votre adresse complète"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
                <p className="text-xs text-gray-500">
                  Minimum 6 caractères
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="terms" 
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                />
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  J'accepte les conditions d'utilisation
                </label>
              </div>

              <Button 
                type="submit" 
                className="w-full text-white font-semibold"
                style={{ backgroundColor: "#00853F" }}
                disabled={loading}
              >
                {loading ? "Inscription en cours..." : "S'inscrire comme Parent"}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-gray-600">
              Vous avez déjà un compte ?{" "}
              <Button 
                type="button" 
                variant="link" 
                className="text-green-600 hover:text-green-700"
                onClick={() => navigate('/login')}
              >
                Se connecter
              </Button>
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
