import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { Amplify } from 'aws-amplify';
import ConfigureAmplifyClientSide from '@/amplify-cognito-config'
import ProtectedRoute from '@/components/ProtectedRoutes';
import { useRouter } from 'next/router';


const publicPaths = ['/', '/login'];


export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  return (
  <>
  {publicPaths.includes(router.pathname) ? (
        <Component {...pageProps} />
      ) : (
  <ProtectedRoute>
  <ConfigureAmplifyClientSide />
  <Component {...pageProps} />
  </ProtectedRoute>
  )}
  </>
  )
}

