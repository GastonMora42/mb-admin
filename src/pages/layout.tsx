// src/pages/layout.tsx
import { inter } from "@/components/fonts";
import ConfigureAmplifyClientSide from "@/amplify-cognito-config";
import Head from 'next/head';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <Head>
        <title>MB Admin</title>
        <meta name="description" content="Sistema de Administración del Estudio de Danzas de Micaela Meindl" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icon-32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icon-16.png" />
        <meta name="theme-color" content="#FFC001" />
      </Head>
      <body className={inter.className}>
        <ConfigureAmplifyClientSide />
        {children}
      </body>
    </html>
  );
}