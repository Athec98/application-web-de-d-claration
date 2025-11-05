import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Save, User, LogOut } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

export default function ParentProfile() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  
  // Données utilisateur réelles depuis localStorage ou API
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    phoneNumber: "",
    address: "",
  });

  // Charger les données utilisateur au montage du composant
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // D'abord essayer de charger depuis localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setProfileData({
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            email: user.email || "",
            phone: user.phone || "",
            phoneNumber: user.phone || user.phoneNumber || "",
            address: user.address || "",
          });
        }

        // Ensuite récupérer les données à jour depuis l'API
        const token = localStorage.getItem('token');
        if (token) {
          const response = await axios.get('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.data && response.data.success && response.data.user) {
            const user = response.data.user;
            setProfileData({
              firstName: user.firstName || "",
              lastName: user.lastName || "",
              email: user.email || "",
              phone: user.phone || "",
              phoneNumber: user.phone || user.phoneNumber || "",
              address: user.address || "",
            });
            
            // Mettre à jour localStorage
            localStorage.setItem('user', JSON.stringify(user));
          }
        }
      } catch (error: any) {
        console.error('Erreur lors du chargement des données utilisateur:', error);
        // Si l'API échoue, garder les données du localStorage
      } finally {
        setLoadingData(false);
      }
    };

    loadUserData();
  }, []);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Vous devez être connecté");
        setLocation("/login");
        return;
      }

      const response = await axios.put('/api/auth/update-profile', {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone || profileData.phoneNumber,
        address: profileData.address,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data.success) {
        // Mettre à jour localStorage avec les nouvelles données
        const updatedUser = { ...JSON.parse(localStorage.getItem('user') || '{}'), ...response.data.user };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        toast.success("Profil mis à jour avec succès !");
      }
    } catch (error: any) {
      console.error('Erreur mise à jour profil:', error);
      const errorMessage = error.response?.data?.message || "Erreur lors de la mise à jour du profil";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Vous devez être connecté");
        setLocation("/login");
        return;
      }

      const response = await axios.put('/api/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data.success) {
        toast.success("Mot de passe modifié avec succès !");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error: any) {
      console.error('Erreur changement mot de passe:', error);
      const errorMessage = error.response?.data?.message || "Erreur lors du changement de mot de passe";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => {
                  window.location.href = '/dashboard';
                }}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-3">
                <User className="h-6 w-6" style={{ color: "#00853F" }} />
                <div>
                  <h1 className="text-xl font-bold" style={{ color: "#006B32" }}>
                    Mon Profil
                  </h1>
                  <p className="text-sm text-gray-600">
                    Gérez vos informations personnelles
                  </p>
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => {
                // Nettoyer le localStorage
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('tempUserId');
                
                // Rediriger immédiatement vers la page de connexion avec un rechargement complet
                // Utiliser replace() pour éviter que l'utilisateur puisse revenir en arrière
                window.location.replace('/login');
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Informations personnelles */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Informations Personnelles</CardTitle>
            <CardDescription>
              Modifiez vos informations de profil
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom *</Label>
                  <Input
                    id="firstName"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom *</Label>
                  <Input
                    id="lastName"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Numéro de téléphone *</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={profileData.phoneNumber}
                  onChange={(e) => setProfileData({...profileData, phoneNumber: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Input
                  id="address"
                  value={profileData.address}
                  onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                />
              </div>

              <div className="flex justify-end">
                <Button 
                  type="submit"
                  className="text-white"
                  style={{ backgroundColor: "#00853F" }}
                  disabled={loading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Enregistrement..." : "Enregistrer les modifications"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Changement de mot de passe */}
        <Card>
          <CardHeader>
            <CardTitle>Sécurité</CardTitle>
            <CardDescription>
              Modifiez votre mot de passe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Mot de passe actuel *</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  required
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nouveau mot de passe *</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  placeholder="Au moins 8 caractères"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  required
                />
              </div>

              <div className="flex justify-end">
                <Button 
                  type="submit"
                  className="text-white"
                  style={{ backgroundColor: "#00853F" }}
                  disabled={loading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Modification..." : "Changer le mot de passe"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-600">
          <p>République du Sénégal</p>
          <p className="font-semibold">Un Peuple - Un But - Une Foi</p>
        </div>
      </footer>
    </div>
  );
}
