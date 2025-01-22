// src/pages/layout.tsx
import { inter } from "@/components/fonts";
import ConfigureAmplifyClientSide from "@/amplify-cognito-config";
import type { Metadata } from 'next';

export const metadata: Metadata = {
 title: 'MB Admin',
 description: 'Sistema de Administración del Estudio de Danzas de Micaela Meindl',
 icons: {
   icon: [
     { url: '/favicon.ico' },
     { url: '/icon-16.png', sizes: '16x16', type: 'image/png' },
     { url: '/icon-32.png', sizes: '32x32', type: 'image/png' },
     { url: '/icon-64.png', sizes: '64x64', type: 'image/png' }
   ],
   apple: [
     { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }
   ],
   shortcut: ['/favicon.ico']
 }
};

export default function RootLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return (
   <html lang="es">
     <head>
       <link rel="icon" href="/favicon.ico" />
       <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon.png" />
       <link rel="icon" type="image/png" sizes="32x32" href="/icon-32.png" />
       <link rel="icon" type="image/png" sizes="16x16" href="/icon-16.png" />
       <meta name="theme-color" content="#FFC001" />
     </head>
     <body className={inter.className}>
       <ConfigureAmplifyClientSide />
       {children}
     </body>
   </html>
 );
}