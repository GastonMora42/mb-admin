import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import ConfigureAmplifyClientSide from '@/amplify-cognito-config'
import ProtectedRoute from '@/components/ProtectedRoutes'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth'
import { Hub } from 'aws-amplify/utils'
import { createGlobalStyle } from 'styled-components'

const GlobalStyle = createGlobalStyle`

  input, textarea, select, label, option, td, p, .highlight, text {
    color: #000000 !important;
    -webkit-text-fill-color: #000000 !important;
  }


  input, textarea, select {
    color: #000000 !important;
    -webkit-text-fill-color: #000000 !important;
    &::placeholder {
      color: #666666 !important;
      -webkit-text-fill-color: #666666 !important;
    }
    &::-webkit-input-placeholder {
      color: #666666 !important;
      -webkit-text-fill-color: #666666 !important;
    }
    &:-ms-input-placeholder {
      color: #666666 !important;
    }
    &:-webkit-autofill,
    &:-webkit-autofill:hover,
    &:-webkit-autofill:focus {
      -webkit-text-fill-color: #000000 !important;
      -webkit-box-shadow: 0 0 0px 1000px white inset !important;
    }
  }


  option, .highlight {
    color: #000000 !important;
    -webkit-text-fill-color: #000000 !important;
    background-color: white !important;
  }


  [dangerouslySetInnerHTML], 
  [class*="Terms"], 
  .TermsContent,
  .TermsModal {
    color: #000000 !important;
    -webkit-text-fill-color: #000000 !important;
  }


  [dangerouslySetInnerHTML] * {
    color: #000000 !important;
    -webkit-text-fill-color: #000000 !important;
  }


  div[style*="background-color: white"],
  div[style*="background-color: #FFFFFF"],
  div[style*="background-color: #fff"],
  div[style*="background: white"],
  div[style*="background: #FFFFFF"],
  div[style*="background: #fff"] {
    color: #000000 !important;
  }


  div:not([style*="background-color: white"]):not([style*="background-color: #FFFFFF"]):not([style*="background-color: #fff"]):not([style*="background: white"]):not([style*="background: #FFFFFF"]):not([style*="background: #fff"]) {
    color: inherit;
  }


  .white-bg {
    color: #000000 !important;
    -webkit-text-fill-color: #000000 !important;
  }
`;

const publicPaths = ['/', '/login', '/register', '/confirm-register']

// Componente para gestionar sesiones
function SessionManager() {
  useEffect(() => {
    // Verificar y recuperar la sesión si es necesario
    const checkAndRefreshSession = async () => {
      try {
        // Intentar obtener la sesión actual
        await getCurrentUser();
      } catch (error) {
        console.log("Problema con la sesión, intentando refrescar...");
        
        try {
          // Intentar refrescar la sesión
          await fetchAuthSession({ forceRefresh: true });
          console.log("Sesión recuperada exitosamente");
        } catch (refreshError) {
          console.error("Error al refrescar la sesión:", refreshError);
        }
      }
    };

    // Comprobar inmediatamente y luego cada 5 minutos
    checkAndRefreshSession();
    const intervalId = setInterval(checkAndRefreshSession, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  return null;
}

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
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      setIsCheckingAuth(true);
      try {
        const session = await fetchAuthSession();
        setIsAuthenticated(!!session.tokens);
      } catch (error) {
        console.error("Error al verificar sesión:", error);
        setIsAuthenticated(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    
    const listener = Hub.listen('auth', ({ payload }) => {
      const { event } = payload;
      if (event === 'signedIn') setIsAuthenticated(true);
      if (event === 'signedOut') setIsAuthenticated(false);
    });
    
    checkAuth();
    
    // Verificar la sesión periódicamente
    const intervalId = setInterval(checkAuth, 5 * 60 * 1000); // Cada 5 minutos
    
    return () => {
      listener();
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated === false && !isCheckingAuth && !publicPaths.includes(router.pathname)) {
      router.push('/login');
    }
  }, [isAuthenticated, isCheckingAuth, router, router.pathname]);

  // Mostrar un indicador de carga mientras se verifica la autenticación
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span>Verificando sesión...</span>
          </div>
        </div>
      </div>
    );
  }

  if (isAuthenticated === null) {
    return null;
  }

  return (
    <>
      {publicPaths.includes(router.pathname) ? (
        <Component {...pageProps} />
      ) : (
        <ProtectedRoute>
          <Component {...pageProps} />
        </ProtectedRoute>
      )}
    </>
  );
}

export default function App(props: AppProps) {
  return (
    <>
      <GlobalStyle />
      <SafeHydrate>
        <ConfigureAmplifyClientSide />
        <SessionManager />
        <AppContent {...props} />
      </SafeHydrate>
    </>
  );
}