import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { Amplify } from 'aws-amplify';
import ConfigureAmplifyClientSide from '@/amplify-cognito-config'



export default function App({ Component, pageProps }: AppProps) {
  return (
  <>
  <ConfigureAmplifyClientSide />
  <Component {...pageProps} />
  </>
  )
}