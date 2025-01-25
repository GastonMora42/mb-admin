import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import ConfigureAmplifyClientSide from '@/amplify-cognito-config'
import ProtectedRoute from '@/components/ProtectedRoutes'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { getCurrentUser } from 'aws-amplify/auth'
import { Hub as AWSHub } from '@aws-amplify/core'

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
   <SafeHydrate>
     <ConfigureAmplifyClientSide />
     <AppContent {...props} />
   </SafeHydrate>
 )
}