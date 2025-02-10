import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import ConfigureAmplifyClientSide from '@/amplify-cognito-config'
import ProtectedRoute from '@/components/ProtectedRoutes'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { fetchAuthSession } from 'aws-amplify/auth'
import { Hub } from 'aws-amplify/utils'
import { createGlobalStyle } from 'styled-components'

const GlobalStyle = createGlobalStyle`
  /* Estilos base para textos y elementos de formulario */
  input, textarea, select, label, option, td, p, .highlight, text {
    color: #000000 !important;
    -webkit-text-fill-color: #000000 !important;
  }

  /* Específico para inputs y sus valores */
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

  /* Para las opciones de select y texto dinámico */
  option, .highlight {
    color: #000000 !important;
    -webkit-text-fill-color: #000000 !important;
    background-color: white !important;
  }

  /* Para contenido HTML dinámico */
  [dangerouslySetInnerHTML], 
  [class*="Terms"], 
  .TermsContent,
  .TermsModal {
    color: #000000 !important;
    -webkit-text-fill-color: #000000 !important;
  }

  /* Para todos los elementos dentro de contenido dinámico */
  [dangerouslySetInnerHTML] * {
    color: #000000 !important;
    -webkit-text-fill-color: #000000 !important;
  }

  /* Nuevo: Para divs con fondo blanco */
  div[style*="background-color: white"],
  div[style*="background-color: #FFFFFF"],
  div[style*="background-color: #fff"],
  div[style*="background: white"],
  div[style*="background: #FFFFFF"],
  div[style*="background: #fff"] {
    color: #000000 !important;
  }

  /* Nuevo: Para mantener contraste en divs con otros fondos */
  div:not([style*="background-color: white"]):not([style*="background-color: #FFFFFF"]):not([style*="background-color: #fff"]):not([style*="background: white"]):not([style*="background: #FFFFFF"]):not([style*="background: #fff"]) {
    color: inherit;
  }

  /* Nuevo: Clase de utilidad para forzar texto negro en fondo blanco */
  .white-bg {
    color: #000000 !important;
    -webkit-text-fill-color: #000000 !important;
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
       const session = await fetchAuthSession()
       setIsAuthenticated(!!session.tokens)
     } catch {
       setIsAuthenticated(false)
     }
   }
   
   const listener = Hub.listen('auth', ({ payload }) => {
    const { event } = payload
    if (event === 'signedIn') setIsAuthenticated(true)
    if (event === 'signedOut') setIsAuthenticated(false)
   })
  
   checkAuth()
   
   // Verificar la sesión periódicamente
   const intervalId = setInterval(checkAuth, 15 * 60 * 1000) // cada 15 minutos
   
   return () => {
     listener()
     clearInterval(intervalId)
   }
 }, [])

 useEffect(() => {
   if (isAuthenticated === false && !publicPaths.includes(router.pathname)) {
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