// Configuration des rôles et des redirections
export const ROLES = {
  PARENT: 'parent',
  MAIRIE: 'mairie',
  HOPITAL: 'hopital',
  ADMIN: 'admin'
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

// Configuration des redirections par rôle
export const ROLE_REDIRECTS: Record<UserRole, string> = {
  [ROLES.PARENT]: '/dashboard',
  [ROLES.MAIRIE]: '/mairie/dashboard',
  [ROLES.HOPITAL]: '/hopital/dashboard',
  [ROLES.ADMIN]: '/admin/dashboard'
};

// Vérifier si un utilisateur a un rôle spécifique
export const hasRole = (userRole: UserRole, requiredRole: UserRole): boolean => {
  // L'admin a accès à tout
  if (userRole === ROLES.ADMIN) return true;
  
  // Vérifier le rôle spécifique
  return userRole === requiredRole;
};

// Vérifier si un utilisateur a l'un des rôles requis
export const hasAnyRole = (userRole: UserRole, requiredRoles: UserRole[]): boolean => {
  // L'admin a accès à tout
  if (userRole === ROLES.ADMIN) return true;
  
  // Vérifier si l'utilisateur a l'un des rôles requis
  return requiredRoles.includes(userRole);
};
