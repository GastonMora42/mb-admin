// hooks/useAuthPersistence.ts
import { useEffect, useState } from 'react';
import { getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';

// Definimos el tipo para los eventos de autenticación
type AuthEventType = 
  | 'signedIn'
  | 'signedOut'
  | 'tokenRefresh'
  | 'tokenRefresh_failure'
  | 'signInWithRedirect'
  | 'signInWithRedirect_failure'
  | 'customOAuthState';

interface AuthPayload {
  event: AuthEventType;
  data?: any;
}

export function useAuthPersistence() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  async function checkAuth() {
    try {
      const user = await getCurrentUser();
      const attributes = await fetchUserAttributes();
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      setIsAuthenticated(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    checkAuth();

    const unsubscribe = Hub.listen('auth', ({ payload }: { payload: AuthPayload }) => {
      switch (payload.event) {
        case 'signedIn':
          setIsAuthenticated(true);
          break;
        case 'signedOut':
          setIsAuthenticated(false);
          break;
        case 'tokenRefresh':
          checkAuth();
          break;
        case 'tokenRefresh_failure':
          setIsAuthenticated(false);
          break;
      }
    });

    const intervalId = setInterval(checkAuth, 5 * 60 * 1000);

    return () => {
      unsubscribe();
      clearInterval(intervalId);
    };
  }, []);

  return { isAuthenticated, isLoading };
}