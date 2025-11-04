import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { Streamdown } from "streamdown";

export default function Home() {
  const { user, loading, error, isAuthenticated, logout } = useAuth();
  const loginUrl = getLoginUrl();

  const handlePrimaryAction = () => {
    if (isAuthenticated) {
      logout();
      return;
    }

    window.location.href = loginUrl;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-white">
        <div className="container mx-auto flex items-center justify-between px-4 py-6">
          <div className="flex items-center space-x-3">
            <img
              src={APP_LOGO}
              alt={APP_TITLE}
              className="h-12 w-12 rounded-full object-cover"
            />
            <div>
              <h1 className="text-2xl font-bold text-senegal-green-dark">{APP_TITLE}</h1>
              <p className="text-sm text-gray-500">
                {isAuthenticated
                  ? `Bienvenue ${user?.name ?? user?.firstName ?? ""}`.trim()
                  : "Plateforme nationale de gestion des déclarations de naissance"}
              </p>
            </div>
          </div>
          <Button onClick={handlePrimaryAction} variant="default">
            {isAuthenticated ? "Se déconnecter" : "Se connecter"}
          </Button>
        </div>
      </header>

      <main className="container mx-auto flex-1 px-4 py-10">
        {loading ? (
          <div className="flex items-center space-x-3 text-gray-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Chargement de votre espace sécurisé…</span>
          </div>
        ) : (
          <div className="space-y-8">
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-senegal-green-dark">
                {isAuthenticated ? "Résumé de votre compte" : "Pourquoi créer un compte"}
              </h2>
              <Streamdown>
                {isAuthenticated
                  ? `- **Nom complet :** ${user?.name ?? "Non renseigné"}
- **Rôle :** ${user?.role ?? "parent"}
- Utilisez le tableau de bord pour suivre vos démarches en temps réel.`
                  : `- Inscrivez-vous pour déclarer une naissance en quelques minutes.
- Suivez l'avancement de vos dossiers sans vous déplacer.
- Recevez des notifications lorsque de nouvelles étapes sont disponibles.`}
              </Streamdown>
              {!isAuthenticated && (
                <Button asChild variant="secondary">
                  <a href={loginUrl}>Commencer la déclaration</a>
                </Button>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
