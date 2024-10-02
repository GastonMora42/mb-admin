import { Amplify, type ResourcesConfig } from "aws-amplify";
import React from "react";

const authConfig: ResourcesConfig["Auth"] = { 
  Cognito: {
    userPoolId: "us-east-1_OpCljWDF7",
    userPoolClientId: "7tmctt10ht1q3tff359eii7jv0",
  },
};

// Configuración inicial para SSR
Amplify.configure(
  {
    Auth: authConfig,
  },
  { ssr: true }
);

// Función para configurar Amplify en el lado del cliente
export function configureAmplifyClientSide() {
  if (typeof window !== 'undefined') {
    console.log('Auth Config:', authConfig);
    Amplify.configure(
      {
        Auth: authConfig,
      },
      { ssr: true }  // Cambiado a false para el lado del cliente
    );
  }
}

// Componente para usar en _app.tsx o similar
export default function ConfigureAmplifyClientSide() {
  React.useEffect(() => {
    configureAmplifyClientSide();
  }, []);

  return null;
}