import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { Amplify } from 'aws-amplify';
import ConfigureAmplifyClientSide from '@/amplify-cognito-config'
import ProtectedRoute from '@/components/ProtectedRoutes';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const publicPaths = ['/', '/login', '/register', '/confirm-register'];

function SafeHydrate({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted ? <>{children}</> : null;
}

function AppContent({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Ejemplo con Amplify Auth:
        // await Auth.currentAuthenticatedUser();
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (!isAuthenticated && !publicPaths.includes(router.pathname)) {
      router.push('/login');
    }
  }, [isAuthenticated, router, router.pathname]);

  if (isAuthenticated === null) {
    return null;
  }

  if (publicPaths.includes(router.pathname)) {
    return <Component {...pageProps} />;
  }

  return (
    <ProtectedRoute>
      <ConfigureAmplifyClientSide />
      <Component {...pageProps} />
    </ProtectedRoute>
  );
}

export default function App(props: AppProps) {
  return (
    <SafeHydrate>
      <AppContent {...props} />
    </SafeHydrate>
  );
}