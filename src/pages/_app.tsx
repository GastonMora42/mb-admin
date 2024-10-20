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
    // Aquí deberías implementar tu lógica de verificación de autenticación
    // Por ejemplo, usando Amplify Auth o tu método de autenticación preferido
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

  if (isAuthenticated === null) {
    // Aún no sabemos si el usuario está autenticado, mostramos un loader o nada
    return null;
  }

  if (!isAuthenticated && !publicPaths.includes(router.pathname)) {
    // Usuario no autenticado intentando acceder a una ruta protegida
    // Redirigimos al login
    useEffect(() => {
      router.push('/login');
    }, [router]);
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