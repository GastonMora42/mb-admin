import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import ConfigureAmplifyClientSide from '@/amplify-cognito-config'
import ProtectedRoute from '@/components/ProtectedRoutes'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { getCurrentUser } from 'aws-amplify/auth'
import { Hub as AWSHub } from '@aws-amplify/core'
import { createGlobalStyle } from 'styled-components'

const GlobalStyle = createGlobalStyle`
  /* Estilos base para elementos de formulario */
  input, textarea, select, label, option, td, p, .highlight {
    color: #000000;
  }

  /* Inputs y campos de texto */
  input, textarea, select {
    color: #000000;
    background-color: #ffffff;
    border: 1px solid #cccccc;

    &::placeholder {
      color: #666666;
    }

    &:-webkit-autofill,
    &:-webkit-autofill:hover,
    &:-webkit-autofill:focus {
      -webkit-text-fill-color: #000000;
      -webkit-box-shadow: 0 0 0px 1000px white inset;
      transition: background-color 5000s ease-in-out 0s;
    }
  }

  /* Select y sus opciones */
  select {
    option {
      color: #000000;
      background-color: #ffffff;
    }
  }

  /* Listas desplegables y autocompletado */
  .autocomplete-dropdown,
  .suggestions-list,
  .dropdown-content {
    background-color: #ffffff;
    border: 1px solid #cccccc;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);

    > * {
      color: #000000;
      background-color: #ffffff;

      &:hover {
        background-color: #f5f5f5;
      }
    }
  }

  /* Mensajes de alerta y notificaciones */
  .alert,
  .notification,
  .message {
    &.success {
      color: #155724;
      background-color: #d4edda;
      border-color: #c3e6cb;
    }

    &.error {
      color: #721c24;
      background-color: #f8d7da;
      border-color: #f5c6cb;
    }

    &.warning {
      color: #856404;
      background-color: #fff3cd;
      border-color: #ffeeba;
    }

    &.info {
      color: #0c5460;
      background-color: #d1ecf1;
      border-color: #bee5eb;
    }
  }

  /* Modales y overlays */
  .modal,
  .overlay,
  .popup {
    background-color: #ffffff;
    color: #000000;

    h1, h2, h3, h4, h5, h6, p, span {
      color: #000000;
    }
  }

  /* Contenido dinámico */
  [dangerouslySetInnerHTML], 
  [class*="Terms"], 
  .TermsContent,
  .TermsModal {
    color: #000000;
    background-color: #ffffff;

    * {
      color: inherit;
    }
  }

  /* Tooltips y popovers */
  .tooltip,
  .popover {
    color: #ffffff;
    background-color: #000000;
    border: 1px solid rgba(0,0,0,0.2);
  }

  /* Elementos de lista y menús desplegables */
  .dropdown-item,
  .list-item {
    color: #000000;
    background-color: #ffffff;

    &:hover {
      background-color: #f8f9fa;
    }

    &.active {
      color: #ffffff;
      background-color: #007bff;
    }
  }
`;

const publicPaths = ['/', '/login', '/register', '/confirm-register']

function SafeHydrate({ children }: { children: React.ReactNode }) {
 const [mounted, setMounted] = useState(false)
 useEffect(() => {
   setMounted(true)
 }, [])
 return mounted ? <>{children}</> : null
}

function AppContent({ Component, pageProps }: AppProps) {
 const router = useRouter()
 const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
 
 useEffect(() => {
   const checkAuth = async () => {
     try {
       await getCurrentUser()
       setIsAuthenticated(true)
     } catch {
       setIsAuthenticated(false)
     }
   }
   
   const listener = AWSHub.listen('auth', ({ payload }) => {
    const { event } = payload
    if (event === 'signedIn') setIsAuthenticated(true)
    if (event === 'signedOut') setIsAuthenticated(false)
   })
  
   checkAuth()
   return () => listener()
 }, [])

 useEffect(() => {
   if (!isAuthenticated && !publicPaths.includes(router.pathname)) {
     router.push('/login')
   }
 }, [isAuthenticated, router, router.pathname])

 if (isAuthenticated === null) {
   return null
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
 )
}

export default function App(props: AppProps) {
 return (
   <>
     <GlobalStyle />
     <SafeHydrate>
       <ConfigureAmplifyClientSide />
       <AppContent {...props} />
     </SafeHydrate>
   </>
 )
}