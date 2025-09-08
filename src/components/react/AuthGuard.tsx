import { useEffect, useState } from 'react';
import { onAuthChange, initAuth } from '@Services/auth';
import type { FirebaseUser as User } from '@Types/user';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export default function AuthGuard({ 
  children, 
  fallback = <AuthLoadingFallback />, 
  redirectTo = '/login' 
}: AuthGuardProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [redirectPlanned, setRedirectPlanned] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    // Helper: check if server cookie exists
    const hasAuthCookie = () =>
      typeof document !== 'undefined' && document.cookie.includes('auth-token=');

    // Initialize auth state
    const initializeAuth = async () => {
      try {
        // Wait for initial auth state
        await initAuth();
        setIsInitialized(true);
        
        // Set up auth state listener
        unsubscribe = onAuthChange((user) => {
          setUser(user);
          setIsLoading(false);

          // If unauthenticated, only redirect when there's no server cookie.
          // If cookie exists, give the client a moment to establish Firebase auth.
          if (!user && redirectTo) {
            if (!hasAuthCookie()) {
              window.location.href = redirectTo;
            } else if (!redirectPlanned) {
              setRedirectPlanned(true);
              // Fallback safety: if after a short delay auth is still not established, redirect.
              setTimeout(() => {
                if (!hasAuthCookie()) {
                  window.location.href = redirectTo;
                }
              }, 3000);
            }
          }
        });
      } catch (error) {
        console.error('Auth initialization error:', error);
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Cleanup on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [redirectTo, redirectPlanned]);

  // Show loading state while initializing
  if (isLoading || !isInitialized) {
    return <>{fallback}</>;
  }

  // Show children if user is authenticated
  if (user) {
    return <>{children}</>;
  }

  // This shouldn't happen due to redirect, but just in case
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
        <p className="text-gray-600 mb-6">You need to be logged in to access this page.</p>
        <a 
          href="/login"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Sign In
        </a>
      </div>
    </div>
  );
}

// Loading fallback component
function AuthLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Checking authentication...</p>
      </div>
    </div>
  );
}

// Hook for using auth in other components
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setUser(user);
      setIsLoading(false);
    });

    // Initialize auth state
    initAuth().then(() => {
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  return { user, isLoading, isAuthenticated: !!user };
}
