import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export default function Register() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
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
      // TODO: Implémenter l'inscription avec l'API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Inscription réussie ! Vérifiez votre email/téléphone pour le code OTP.");
      setLocation("/verify-otp");
    } catch (error) {
      toast.error("Erreur lors de l'inscription");
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
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet *</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Prénom Nom"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Numéro de téléphone *</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  placeholder="+221 XX XXX XX XX"
                  value={formData.phoneNumber}
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
                variant="link" 
                className="text-senegal-green p-0"
                onClick={() => setLocation("/login")}
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
