import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import { isValidName, isValidAddress, isValidEmail, isValidSenegalesePhone } from "@/utils/validation";

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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fieldName = e.target.name;
    const value = e.target.value;
    
    setFormData({
      ...formData,
      [fieldName]: value,
    });

    // Validation en temps réel
    let error = '';
    
    if (fieldName === 'firstName' || fieldName === 'lastName') {
      if (value.trim() && !isValidName(value)) {
        error = `${fieldName === 'firstName' ? 'Le prénom' : 'Le nom'} ne doit contenir que des lettres, espaces, tirets et apostrophes`;
      }
    } else if (fieldName === 'phone') {
      if (value.trim() && !isValidSenegalesePhone(value)) {
        error = 'Le numéro de téléphone doit être au format sénégalais (+221 XX XXX XX XX ou 7XXXXXXXXX)';
      }
    } else if (fieldName === 'email') {
      if (value.trim() && !isValidEmail(value)) {
        error = 'L\'adresse email n\'est pas valide';
      }
    } else if (fieldName === 'address') {
      if (value.trim() && !isValidAddress(value)) {
        error = 'L\'adresse doit contenir au moins 5 caractères';
      }
    } else if (fieldName === 'password') {
      if (value.trim() && value.length < 6) {
        error = 'Le mot de passe doit contenir au moins 6 caractères';
      }
    } else if (fieldName === 'confirmPassword') {
      if (value.trim() && value !== formData.password) {
        error = 'Les mots de passe ne correspondent pas';
      }
    }

    setFieldErrors({ ...fieldErrors, [fieldName]: error });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Empêcher la validation HTML5

    // Réinitialiser les erreurs de champ
    const newFieldErrors: Record<string, string> = {};
    const errors: string[] = [];

    // Validation des champs obligatoires
    if (!formData.firstName || formData.firstName.trim() === "") {
      newFieldErrors.firstName = "Le prénom est obligatoire";
      errors.push("Le prénom est obligatoire");
    } else if (!isValidName(formData.firstName)) {
      newFieldErrors.firstName = "Le prénom ne doit contenir que des lettres, espaces, tirets et apostrophes";
      errors.push("Le prénom ne doit contenir que des lettres, espaces, tirets et apostrophes");
    }
    if (!formData.lastName || formData.lastName.trim() === "") {
      newFieldErrors.lastName = "Le nom est obligatoire";
      errors.push("Le nom est obligatoire");
    } else if (!isValidName(formData.lastName)) {
      newFieldErrors.lastName = "Le nom ne doit contenir que des lettres, espaces, tirets et apostrophes";
      errors.push("Le nom ne doit contenir que des lettres, espaces, tirets et apostrophes");
    }
    if (!formData.phone || formData.phone.trim() === "") {
      newFieldErrors.phone = "Le numéro de téléphone est obligatoire";
      errors.push("Le numéro de téléphone est obligatoire");
    } else if (!isValidSenegalesePhone(formData.phone)) {
      newFieldErrors.phone = "Le numéro de téléphone doit être au format sénégalais (+221 XX XXX XX XX ou 7XXXXXXXXX)";
      errors.push("Le numéro de téléphone doit être au format sénégalais (+221 XX XXX XX XX ou 7XXXXXXXXX)");
    }
    if (formData.email && formData.email.trim() !== "") {
      if (!isValidEmail(formData.email)) {
        newFieldErrors.email = "L'adresse email n'est pas valide";
        errors.push("L'adresse email n'est pas valide");
      }
    }
    if (!formData.address || formData.address.trim() === "") {
      newFieldErrors.address = "L'adresse est obligatoire";
      errors.push("L'adresse est obligatoire");
    } else if (!isValidAddress(formData.address)) {
      newFieldErrors.address = "L'adresse doit contenir au moins 5 caractères";
      errors.push("L'adresse doit contenir au moins 5 caractères");
    }
    if (!formData.password || formData.password.trim() === "") {
      newFieldErrors.password = "Le mot de passe est obligatoire";
      errors.push("Le mot de passe est obligatoire");
    } else if (formData.password.length < 6) {
      newFieldErrors.password = "Le mot de passe doit contenir au moins 6 caractères";
      errors.push("Le mot de passe doit contenir au moins 6 caractères");
    }
    if (!formData.confirmPassword || formData.confirmPassword.trim() === "") {
      newFieldErrors.confirmPassword = "La confirmation du mot de passe est obligatoire";
      errors.push("La confirmation du mot de passe est obligatoire");
    } else if (formData.password !== formData.confirmPassword) {
      newFieldErrors.confirmPassword = "Les mots de passe ne correspondent pas";
      errors.push("Les mots de passe ne correspondent pas");
    }
    if (!acceptTerms) {
      errors.push("Vous devez accepter les conditions d'utilisation");
    }

    // Afficher les erreurs
    setFieldErrors(newFieldErrors);
    
    if (errors.length > 0) {
      toast.error(`Veuillez corriger les erreurs suivantes : ${errors.join(", ")}`);
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...userData } = formData;
      
      const response = await authService.register({
        ...userData,
        name: `${userData.firstName} ${userData.lastName}`.trim()
      });
      
      // Vérifier si la réponse contient des données
      if (!response || !response.data) {
        throw new Error("Réponse du serveur invalide. Veuillez réessayer.");
      }
      
      const responseData = response.data;
      
      // Vérifier si c'est le message indiquant que l'utilisateur existe déjà
      if (responseData.message && responseData.message.includes('Si votre email est valable')) {
        toast.info('Un compte existe déjà avec cet email. Veuillez vous connecter.');
        navigate('/login');
        return;
      }
      
      // Récupérer l'ID utilisateur depuis différentes parties possibles de la réponse
      const userId = responseData.userId || 
                   responseData.user?._id || 
                   responseData.user?.id ||
                   (responseData.user && responseData.user.id);
      
      if (!userId) {
        throw new Error("Erreur lors de la création du compte. Veuillez réessayer ou contacter le support.");
      }
      
      // Stocker l'ID dans le localStorage
      localStorage.setItem('tempUserId', userId);
      
      toast.success("Inscription réussie ! Vérifiez votre email pour le code OTP.");
      navigate('/verify-otp');
    } catch (error: any) {
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
                    onBlur={(e) => {
                      if (!e.target.value.trim()) {
                        setFieldErrors({ ...fieldErrors, firstName: 'Le prénom est obligatoire' });
                      }
                    }}
                  />
                  {fieldErrors.firstName && (
                    <p className="text-sm text-red-600 mt-1">{fieldErrors.firstName}</p>
                  )}
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
                    onBlur={(e) => {
                      if (!e.target.value.trim()) {
                        setFieldErrors({ ...fieldErrors, lastName: 'Le nom est obligatoire' });
                      }
                    }}
                  />
                  {fieldErrors.lastName && (
                    <p className="text-sm text-red-600 mt-1">{fieldErrors.lastName}</p>
                  )}
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
                  onBlur={(e) => {
                    if (!e.target.value.trim()) {
                      setFieldErrors({ ...fieldErrors, phone: 'Le numéro de téléphone est obligatoire' });
                    }
                  }}
                />
                {fieldErrors.phone && (
                  <p className="text-sm text-red-600 mt-1">{fieldErrors.phone}</p>
                )}
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
                {fieldErrors.email && (
                  <p className="text-sm text-red-600 mt-1">{fieldErrors.email}</p>
                )}
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
                  onBlur={(e) => {
                    if (!e.target.value.trim()) {
                      setFieldErrors({ ...fieldErrors, address: 'L\'adresse est obligatoire' });
                    }
                  }}
                />
                {fieldErrors.address && (
                  <p className="text-sm text-red-600 mt-1">{fieldErrors.address}</p>
                )}
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
                  onBlur={(e) => {
                    if (!e.target.value.trim()) {
                      setFieldErrors({ ...fieldErrors, password: 'Le mot de passe est obligatoire' });
                    }
                  }}
                />
                {fieldErrors.password ? (
                  <p className="text-sm text-red-600 mt-1">{fieldErrors.password}</p>
                ) : (
                <p className="text-xs text-gray-500">
                  Minimum 6 caractères
                </p>
                )}
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
                  onBlur={(e) => {
                    if (!e.target.value.trim()) {
                      setFieldErrors({ ...fieldErrors, confirmPassword: 'La confirmation du mot de passe est obligatoire' });
                    } else if (e.target.value !== formData.password) {
                      setFieldErrors({ ...fieldErrors, confirmPassword: 'Les mots de passe ne correspondent pas' });
                    }
                  }}
                />
                {fieldErrors.confirmPassword && (
                  <p className="text-sm text-red-600 mt-1">{fieldErrors.confirmPassword}</p>
                )}
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
