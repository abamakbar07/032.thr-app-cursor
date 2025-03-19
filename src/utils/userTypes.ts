/**
 * User-related types and type guards
 */

export interface User {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  image?: string;
}

/**
 * Type guard to check if a user has admin privileges
 */
export function isAdmin(user: User | null): boolean {
  return !!user && user.role === 'admin';
}

/**
 * Type guard to check if a user is authenticated
 */
export function isAuthenticated(user: User | null): boolean {
  return !!user && !!user.id;
}

/**
 * Get user display name or fallback
 */
export function getUserDisplayName(user: User | null, fallback: string = 'User'): string {
  return (user && user.name) ? user.name : fallback;
}

/**
 * Get user avatar image or fallback
 */
export function getUserAvatar(user: User | null, fallback: string = '/default-avatar.svg'): string {
  return (user && user.image) ? user.image : fallback;
}

/**
 * Get user role display name
 */
export function getUserRoleName(user: User | null): string {
  if (!user || !user.role) return 'Guest';
  
  switch(user.role) {
    case 'admin':
      return 'Admin';
    case 'cousin': 
      return 'Cousin';
    default:
      return user.role.charAt(0).toUpperCase() + user.role.slice(1);
  }
} 