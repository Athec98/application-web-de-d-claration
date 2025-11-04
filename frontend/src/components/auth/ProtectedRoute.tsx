import { useLocation, useNavigate } from 'react-router-dom';
import { ROLES, hasRole, UserRole } from '@/config/roles';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectPath?: string;
}

/**
 * Composant de protection de route qui vérifie si l'utilisateur est authentifié
 * et a le rôle requis pour accéder à la route.
 * 
 * @param children - Le composant à afficher si l'utilisateur est autorisé
 * @param allowedRoles - Les rôles autorisés à accéder à la route (par défaut: tous les rôles authentifiés)
 * @param redirectPath - Le chemin de redirection si l'utilisateur n'est pas autorisé (par défaut: /login)
 * @returns Le composant enfant si autorisé, sinon une redirection
 */
const ProtectedRoute = ({
  children,
  allowedRoles = [ROLES.PARENT, ROLES.MAIRIE, ROLES.HOPITAL, ROLES.ADMIN],
  redirectPath = '/login'
}: ProtectedRouteProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Récupérer l'utilisateur depuis le localStorage
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const token = localStorage.getItem('token');
  
  // Vérifier l'authentification et les rôles
  useEffect(() => {
    if (!token || !user) {
      const redirectTo = encodeURIComponent(location.pathname + location.search);
      navigate(`/login?redirect=${redirectTo}`, { replace: true, state: { from: location } });
      return;
    }

    const userRole = (user.role as UserRole) || ROLES.PARENT;
    const hasRequiredRole = allowedRoles.some(role => hasRole(userRole, role));
    
    if (!hasRequiredRole) {
      console.warn(`Accès refusé: l'utilisateur n'a pas le rôle requis (${user.role} vs ${allowedRoles.join(', ')})`);
      
      const defaultPath = userRole === ROLES.ADMIN ? '/admin/dashboard' : 
                         userRole === ROLES.MAIRIE ? '/mairie/dashboard' :
                         userRole === ROLES.HOPITAL ? '/hopital/dashboard' : '/dashboard';
      
      navigate(redirectPath || defaultPath, { replace: true, state: { from: location } });
    }
  }, [token, user, allowedRoles, location, navigate, redirectPath]);
  
  // Si pas de token ou d'utilisateur, afficher un chargement pendant la redirection
  if (!token || !user) {
    return <div>Chargement de la page...</div>;
  }
  
  // Vérifier les rôles
  const userRole = (user.role as UserRole) || ROLES.PARENT;
  const hasRequiredRole = allowedRoles.some(role => hasRole(userRole, role));
  
  if (!hasRequiredRole) {
    return <div>Vérification des autorisations...</div>;
  }
  
  // Si tout est bon, afficher le composant enfant
  return <>{children}</>;
};

export default ProtectedRoute;
