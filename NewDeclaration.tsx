import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload } from "lucide-react";
import { toast } from "sonner";

export default function NewDeclaration() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Informations enfant
    childFirstName: "",
    childLastName: "",
    childGender: "",
    birthDate: "",
    birthPlace: "",
    
    // Informations père
    fatherFirstName: "",
    fatherLastName: "",
    fatherIdNumber: "",
    
    // Informations mère
    motherFirstName: "",
    motherLastName: "",
    motherIdNumber: "",
    
    // Adresse
    residenceAddress: "",
  });

  const [documents, setDocuments] = useState({
    certificatAccouchement: null as File | null,
    idPere: null as File | null,
    idMere: null as File | null,
    autres: null as File | null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof typeof documents) => {
    if (e.target.files && e.target.files[0]) {
      setDocuments({
        ...documents,
        [field]: e.target.files[0],
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!documents.certificatAccouchement || !documents.idPere || !documents.idMere) {
      toast.error("Veuillez téléverser tous les documents obligatoires");
      return;
    }

    setLoading(true);

    try {
      // TODO: Implémenter la soumission avec l'API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success("Déclaration soumise avec succès !");
      setLocation("/dashboard");
    } catch (error) {
      toast.error("Erreur lors de la soumission");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setLocation("/dashboard")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-senegal-green-dark">
                Nouvelle Déclaration de Naissance
              </h1>
              <p className="text-sm text-gray-600">
                Remplissez tous les champs obligatoires
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Informations de l'enfant */}
          <Card>
            <CardHeader>
              <CardTitle>1. Informations sur l'Enfant</CardTitle>
              <CardDescription>
                Renseignez les informations de l'enfant né
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="childFirstName">Prénom(s) *</Label>
                  <Input
                    id="childFirstName"
                    name="childFirstName"
                    value={formData.childFirstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="childLastName">Nom *</Label>
                  <Input
                    id="childLastName"
                    name="childLastName"
                    value={formData.childLastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="childGender">Sexe *</Label>
                  <Select 
                    value={formData.childGender}
                    onValueChange={(value) => setFormData({ ...formData, childGender: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculin">Masculin</SelectItem>
                      <SelectItem value="feminin">Féminin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthDate">Date et heure de naissance *</Label>
                  <Input
                    id="birthDate"
                    name="birthDate"
                    type="datetime-local"
                    value={formData.birthDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthPlace">Hôpital ou lieu de naissance *</Label>
                <Input
                  id="birthPlace"
                  name="birthPlace"
                  value={formData.birthPlace}
                  onChange={handleChange}
                  placeholder="Ex: Hôpital Principal de Dakar"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Informations des parents */}
          <Card>
            <CardHeader>
              <CardTitle>2. Informations sur les Parents</CardTitle>
              <CardDescription>
                Renseignez les informations du père et de la mère
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Père */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Père</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fatherFirstName">Prénom(s) *</Label>
                    <Input
                      id="fatherFirstName"
                      name="fatherFirstName"
                      value={formData.fatherFirstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fatherLastName">Nom *</Label>
                    <Input
                      id="fatherLastName"
                      name="fatherLastName"
                      value={formData.fatherLastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fatherIdNumber">Numéro de pièce d'identité *</Label>
                  <Input
                    id="fatherIdNumber"
                    name="fatherIdNumber"
                    value={formData.fatherIdNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Mère */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Mère</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="motherFirstName">Prénom(s) *</Label>
                    <Input
                      id="motherFirstName"
                      name="motherFirstName"
                      value={formData.motherFirstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="motherLastName">Nom *</Label>
                    <Input
                      id="motherLastName"
                      name="motherLastName"
                      value={formData.motherLastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motherIdNumber">Numéro de pièce d'identité *</Label>
                  <Input
                    id="motherIdNumber"
                    name="motherIdNumber"
                    value={formData.motherIdNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Adresse */}
              <div className="space-y-2">
                <Label htmlFor="residenceAddress">Adresse de résidence *</Label>
                <Input
                  id="residenceAddress"
                  name="residenceAddress"
                  value={formData.residenceAddress}
                  onChange={handleChange}
                  placeholder="Adresse complète"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Documents justificatifs */}
          <Card>
            <CardHeader>
              <CardTitle>3. Documents Justificatifs</CardTitle>
              <CardDescription>
                Téléversez les documents requis (PDF, JPG, PNG)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="certificatAccouchement">
                  Certificat d'accouchement * 
                  {documents.certificatAccouchement && (
                    <span className="text-green-600 ml-2">✓ Fichier ajouté</span>
                  )}
                </Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="certificatAccouchement"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, "certificatAccouchement")}
                    className="flex-1"
                  />
                  <Upload className="h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="idPere">
                  Pièce d'identité du père *
                  {documents.idPere && (
                    <span className="text-green-600 ml-2">✓ Fichier ajouté</span>
                  )}
                </Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="idPere"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, "idPere")}
                    className="flex-1"
                  />
                  <Upload className="h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="idMere">
                  Pièce d'identité de la mère *
                  {documents.idMere && (
                    <span className="text-green-600 ml-2">✓ Fichier ajouté</span>
                  )}
                </Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="idMere"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, "idMere")}
                    className="flex-1"
                  />
                  <Upload className="h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="autres">
                  Autres documents (optionnel)
                  {documents.autres && (
                    <span className="text-green-600 ml-2">✓ Fichier ajouté</span>
                  )}
                </Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="autres"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, "autres")}
                    className="flex-1"
                  />
                  <Upload className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setLocation("/dashboard")}
            >
              Annuler
            </Button>
            <Button 
              type="submit"
              className="bg-senegal-green hover:bg-senegal-green-dark"
              disabled={loading}
            >
              {loading ? "Soumission..." : "Soumettre la Déclaration"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
