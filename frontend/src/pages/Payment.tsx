import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, CreditCard, Smartphone, Download, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { acteNaissanceService } from "@/services/acteNaissanceService";
import { declarationService } from "@/services/declarationService";

export default function Payment() {
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const acteId = searchParams.get('acteId');
  const declarationId = searchParams.get('declarationId');
  
  const [paymentMethod, setPaymentMethod] = useState<string>('wave');
  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [nombreCopies, setNombreCopies] = useState(1);
  const [amount, setAmount] = useState(250);
  const [acteData, setActeData] = useState<any>(null);
  const [phoneError, setPhoneError] = useState<string>("");

  const PRIX_UNITAIRE = 250; // FCFA

  useEffect(() => {
    // Récupérer le numéro de téléphone de l'utilisateur connecté
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        if (userData.phone) {
          setPhoneNumber(userData.phone);
        }
      } catch (e) {
        console.error('Erreur parsing user data:', e);
      }
    }

    // Charger les données de l'acte si acteId est fourni
    if (acteId) {
      loadActeData();
    } else if (declarationId) {
      // Si on a seulement declarationId, récupérer la déclaration pour trouver l'acte
      loadDeclarationData();
    }
  }, [acteId, declarationId]);

  useEffect(() => {
    setAmount(nombreCopies * PRIX_UNITAIRE);
  }, [nombreCopies]);

  const loadActeData = async () => {
    if (!acteId) return;
    
    try {
      setLoading(true);
      const data = await acteNaissanceService.getActeNaissance(acteId);
      setActeData(data);
      
      // Vérifier que la déclaration est validée et archivée
      if (data.declaration) {
        // Normaliser l'ID de la déclaration (peut être string ou objet)
        const declValue: any = data.declaration;
        const declarationId = typeof declValue === 'string' 
          ? declValue 
          : (typeof declValue === 'object' && declValue !== null 
            ? (declValue._id || declValue.id || String(declValue)) 
            : String(declValue));
        
        if (!declarationId || declarationId === 'undefined' || declarationId === '[object Object]') {
          console.error('ID de déclaration invalide:', data.declaration);
          toast.error("Erreur: ID de déclaration invalide");
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 2000);
          return;
        }
        
        const declaration = await declarationService.getDeclarationById(declarationId);
        if (declaration.statut !== 'validee' && declaration.statut !== 'archivee') {
          toast.error("Le dossier doit être validé et archivé avant de pouvoir télécharger l'acte de naissance");
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 2000);
          return;
        }
      }
    } catch (error: any) {
      console.error("Erreur lors du chargement de l'acte:", error);
      const errorMessage = error.response?.data?.message || "Erreur lors du chargement de l'acte de naissance";
      toast.error(errorMessage);
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const loadDeclarationData = async () => {
    if (!declarationId) return;
    
    try {
      const declaration = await declarationService.getDeclarationById(declarationId);
      if (declaration.acteNaissance) {
        // Normaliser l'ID de l'acte (peut être string ou objet)
        const acteValue: any = declaration.acteNaissance;
        const acteId = typeof acteValue === 'string' 
          ? acteValue 
          : (typeof acteValue === 'object' && acteValue !== null 
            ? (acteValue._id || acteValue.id || String(acteValue)) 
            : String(acteValue));
        
        if (!acteId || acteId === 'undefined' || acteId === '[object Object]') {
          console.error('ID d\'acte invalide:', declaration.acteNaissance);
          toast.error("Erreur: ID d'acte de naissance invalide");
          window.location.href = "/dashboard";
          return;
        }
        
        const acte = await acteNaissanceService.getActeNaissance(acteId);
        setActeData(acte);
      } else {
        toast.error("Aucun acte de naissance généré pour cette déclaration");
        window.location.href = "/dashboard";
      }
    } catch (error: any) {
      console.error("Erreur lors du chargement:", error);
      toast.error("Erreur lors du chargement des données");
    }
  };

  const handlePayment = async () => {
    if (!acteId && !acteData?._id) {
      toast.error("Erreur: Acte de naissance introuvable");
      return;
    }

    // Validation du numéro de téléphone pour mobile money
    if (paymentMethod === 'wave' || paymentMethod === 'orange_money' || paymentMethod === 'mobile_money') {
      setPhoneError("");
      if (!phoneNumber.trim()) {
        setPhoneError("Le numéro de téléphone est obligatoire");
        toast.error("Veuillez entrer votre numéro de téléphone");
        return;
      }
      // Validation du format sénégalais
      const phoneRegex = /^(\+221|221)?[0-9]{9}$/;
      if (!phoneRegex.test(phoneNumber.replace(/\s+/g, ''))) {
        setPhoneError("Le numéro de téléphone doit être au format sénégalais (+221 XX XXX XX XX ou 7XXXXXXXXX)");
        toast.error("Le numéro de téléphone doit être au format sénégalais");
        return;
      }
    }

    if (nombreCopies < 1 || nombreCopies > 10) {
      toast.error("Le nombre de copies doit être entre 1 et 10");
      return;
    }

    setLoading(true);
    try {
      const acteIdToUse = acteId || acteData?._id;
      if (!acteIdToUse) {
        toast.error("Erreur: Identifiant de l'acte introuvable");
        setLoading(false);
        return;
      }

      // Vérifier que la déclaration est validée et archivée
      if (acteData?.declaration) {
        try {
          // Normaliser l'ID de la déclaration (peut être string ou objet)
          const declarationId = typeof acteData.declaration === 'string' 
            ? acteData.declaration 
            : (acteData.declaration._id || acteData.declaration.id || String(acteData.declaration));
          
          if (!declarationId || declarationId === 'undefined' || declarationId === '[object Object]') {
            console.error('ID de déclaration invalide:', acteData.declaration);
            toast.error("Erreur: ID de déclaration invalide");
            setLoading(false);
            return;
          }
          
          const declaration = await declarationService.getDeclarationById(declarationId);
          if (declaration.statut !== 'validee' && declaration.statut !== 'archivee') {
            toast.error("Le dossier doit être validé et archivé avant de pouvoir télécharger l'acte de naissance");
            setLoading(false);
            return;
          }
        } catch (error: any) {
          console.error("Erreur lors de la vérification de la déclaration:", error);
          toast.error("Erreur lors de la vérification du statut du dossier");
          setLoading(false);
          return;
        }
      }
      
      // Initier le paiement
      const paymentData = await acteNaissanceService.initiatePayment(
        acteIdToUse,
        nombreCopies,
        paymentMethod
      );

      // Vérifier si c'est une URL de paiement externe (Wave, Orange Money, etc.)
      // ou une URL API interne (à ne pas utiliser avec window.location.href)
      const isExternalPayment = paymentData.paymentUrl && 
        !paymentData.paymentUrl.startsWith('/api/') && 
        !paymentData.paymentUrl.startsWith('http://localhost') &&
        !paymentData.paymentUrl.startsWith('http://192.168.');
      
      if (isExternalPayment) {
        // Rediriger vers la page de paiement externe
        window.location.href = paymentData.paymentUrl;
      } else {
        // Si pas d'URL de paiement externe, simuler le paiement
        // En production, cela devrait être géré par le webhook du processeur de paiement
        toast.info("Simulation du paiement...");
        
        // Simuler une confirmation de paiement après 2 secondes
        setTimeout(async () => {
          try {
            // Confirmer le paiement et télécharger directement
            const blob = await acteNaissanceService.confirmPaymentAndDownload(paymentData.referencePaiement);
            
            // Créer un lien de téléchargement
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `acte_naissance_${nombreCopies > 1 ? `${nombreCopies}_copies` : ''}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            setPaymentSuccess(true);
            toast.success("Paiement effectué et document téléchargé avec succès !");
          } catch (error: any) {
            console.error("Erreur lors du téléchargement:", error);
            const errorMessage = error.response?.data?.message || "Erreur lors du téléchargement du document";
            toast.error(errorMessage);
          } finally {
            setLoading(false);
          }
        }, 2000);
      }
    } catch (error: any) {
      console.error("Erreur lors du paiement:", error);
      const errorMessage = error.response?.data?.message || "Erreur lors du paiement. Veuillez réessayer.";
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-green-600">Paiement Réussi !</h2>
              <p className="text-gray-600">
                Votre paiement de {amount.toLocaleString()} FCFA a été effectué avec succès.
              </p>
              <p className="text-gray-600">
                {nombreCopies} copie(s) de votre acte de naissance {nombreCopies > 1 ? 'ont été téléchargées' : 'a été téléchargée'}.
              </p>
              <Button 
                className="text-white mt-4"
                style={{ backgroundColor: "#00853F" }}
                onClick={() => {
                  window.location.href = "/dashboard";
                }}
              >
                Retour au tableau de bord
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => {
                window.location.href = "/dashboard";
              }}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-senegal-green-dark">
                Paiement et Téléchargement
              </h1>
              <p className="text-sm text-gray-600">
                Téléchargez votre acte de naissance
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Paiement et Téléchargement</CardTitle>
            <CardDescription>
              Choisissez le nombre de copies et le mode de paiement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Nombre de copies */}
            <div className="space-y-2">
              <Label htmlFor="copies">Nombre de copies *</Label>
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setNombreCopies(Math.max(1, nombreCopies - 1))}
                  disabled={nombreCopies <= 1}
                >
                  -
                </Button>
                <Input
                  id="copies"
                  type="number"
                  min="1"
                  value={nombreCopies}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    setNombreCopies(Math.max(1, val));
                  }}
                  className="w-20 text-center"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setNombreCopies(nombreCopies + 1)}
                >
                  +
                </Button>
                <span className="text-sm text-gray-600">
                  {PRIX_UNITAIRE.toLocaleString()} FCFA par copie
                </span>
              </div>
            </div>

            {/* Montant total */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Montant total:</span>
                <span className="text-2xl font-bold text-senegal-green-dark">
                  {amount.toLocaleString()} FCFA
                </span>
              </div>
            </div>

            {/* Mode de paiement */}
            <div className="space-y-2">
              <Label>Mode de paiement *</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un mode de paiement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wave">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4" />
                      <span>Wave</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="orange_money">
                    <div className="flex items-center space-x-2">
                      <Smartphone className="h-4 w-4" />
                      <span>Orange Money</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="mobile_money">
                    <div className="flex items-center space-x-2">
                      <Smartphone className="h-4 w-4" />
                      <span>Mobile Money (Autre)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="bank">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4" />
                      <span>Virement Bancaire</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Numéro de téléphone pour mobile money */}
            {(paymentMethod === 'wave' || paymentMethod === 'orange_money' || paymentMethod === 'mobile_money') && (
              <div className="space-y-2">
                <Label htmlFor="phone">Numéro de téléphone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+221 77 123 45 67"
                    value={phoneNumber}
                    onChange={(e) => {
                      const value = e.target.value;
                      setPhoneNumber(value);
                      // Validation en temps réel
                      if (value.trim()) {
                        const phoneRegex = /^(\+221|221)?[0-9]{9}$/;
                        if (!phoneRegex.test(value.replace(/\s+/g, ''))) {
                          setPhoneError("Le numéro de téléphone doit être au format sénégalais (+221 XX XXX XX XX ou 7XXXXXXXXX)");
                        } else {
                          setPhoneError("");
                        }
                      } else {
                        setPhoneError("");
                      }
                    }}
                    onBlur={(e) => {
                      const value = e.target.value;
                      if (!value.trim()) {
                        setPhoneError("Le numéro de téléphone est obligatoire");
                      } else {
                        const phoneRegex = /^(\+221|221)?[0-9]{9}$/;
                        if (!phoneRegex.test(value.replace(/\s+/g, ''))) {
                          setPhoneError("Le numéro de téléphone doit être au format sénégalais (+221 XX XXX XX XX ou 7XXXXXXXXX)");
                        }
                      }
                    }}
                  />
                {phoneError && (
                  <p className="text-sm text-red-600 mt-1">{phoneError}</p>
                )}
              </div>
            )}

            {/* Informations de l'acte */}
            {acteData && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold mb-2">Informations de l'acte:</h3>
                <div className="space-y-1 text-sm text-gray-700">
                  <p><strong>Enfant:</strong> {acteData.prenomEnfant} {acteData.nomEnfant}</p>
                  <p><strong>Numéro d'acte:</strong> {acteData.numeroActe}</p>
                  <p><strong>Année:</strong> {acteData.annee}</p>
                </div>
              </div>
            )}

            {/* Bouton de paiement */}
            <Button 
              className="w-full text-white"
              style={{ backgroundColor: "#00853F" }}
              onClick={handlePayment}
              disabled={loading || !acteId && !acteData}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Traitement...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Payer et Télécharger ({amount.toLocaleString()} FCFA)
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
