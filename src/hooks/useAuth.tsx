'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
  } | null;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  error: null,
  signIn: async () => false,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check if user is logged in on component mount
  useEffect(() => {
    async function loadUserFromSession() {
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();

        if (data && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Failed to load user session:', err);
        setError('Failed to load user session');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadUserFromSession();
  }, []);

  // Sign in handler
  const signIn = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await nextAuthSignIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (!response?.ok) {
        setError(response?.error || 'Failed to sign in');
        return false;
      }

      // Refresh the session data
      const sessionResponse = await fetch('/api/auth/session');
      const sessionData = await sessionResponse.json();

      if (sessionData && sessionData.user) {
        setUser(sessionData.user);
        return true;
      } else {
        setError('Failed to retrieve user data');
        return false;
      }
    } catch (err) {
      console.error('Sign in error:', err);
      setError('An unexpected error occurred');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out handler
  const signOut = async (): Promise<void> => {
    setIsLoading(true);

    try {
      await nextAuthSignOut({ redirect: false });
      setUser(null);
      router.push('/signin');
    } catch (err) {
      console.error('Sign out error:', err);
      setError('Failed to sign out');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, error, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 