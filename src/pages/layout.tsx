// src/pages/layout.tsx
import { inter } from "@/components/fonts";
import ConfigureAmplifyClientSide from "@/amplify-cognito-config";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Next.js Cognito Authentication</title>
        <meta name="description" content="Cognito authenticated Next.js app." />
      </head>
      <body className={inter.className}>
        <ConfigureAmplifyClientSide />
        {children}
      </body>
    </html>
  );
}