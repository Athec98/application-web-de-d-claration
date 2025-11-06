import { getLoginUrl } from "@/const";
import { useCallback, useEffect, useMemo, useState } from "react";
import api from "@/services/api";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = getLoginUrl() } =
    options ?? {};
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Charger l'utilisateur depuis localStorage et vérifier avec l'API
  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
        const userStr = localStorage.getItem('user');
        
        if (!token || !userStr) {
          setUser(null);
          setLoading(false);
          return;
        }

        // Parser l'utilisateur depuis localStorage
        const storedUser = JSON.parse(userStr);
        setUser(storedUser);
        
        // Optionnel: Vérifier avec l'API si le token est toujours valide
        // Vous pouvez ajouter un endpoint /api/auth/me si nécessaire
        // const response = await api.get('/auth/me');
        // setUser(response.data.user);
        
      } catch (err: any) {
        console.error('Erreur lors du chargement de l\'utilisateur:', err);
        setError(err);
        setUser(null);
        // Nettoyer le localStorage si erreur
        localStorage.removeItem('token');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const logout = useCallback(async () => {
    try {
      // Nettoyer localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      localStorage.removeItem('tempUserId');
      setUser(null);
      
      // Optionnel: Appeler l'API pour déconnecter côté serveur
      // await api.post('/auth/logout');
    } catch (err: any) {
      console.error('Erreur lors de la déconnexion:', err);
      // Même en cas d'erreur, nettoyer le localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      setUser(null);
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      if (!token) {
        setUser(null);
        return;
      }
      
      // Recharger depuis localStorage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        setUser(JSON.parse(userStr));
      }
      
      // Optionnel: Recharger depuis l'API
      // const response = await api.get('/auth/me');
      // setUser(response.data.user);
      // localStorage.setItem('user', JSON.stringify(response.data.user));
    } catch (err: any) {
      console.error('Erreur lors du rafraîchissement:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const state = useMemo(() => {
    return {
      user,
      loading,
      error,
      isAuthenticated: Boolean(user),
    };
  }, [user, loading, error]);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (loading) return;
    if (user) return;
    if (typeof window === "undefined") return;
    if (window.location.pathname === redirectPath) return;

    window.location.href = redirectPath;
  }, [
    redirectOnUnauthenticated,
    redirectPath,
    loading,
    user,
  ]);

  return {
    ...state,
    refresh,
    logout,
  };
}
