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
      { ssr: false }  // Cambiado a false para el lado del cliente
    );
  }
}

// Función para manejar la caducidad de la sesión
function handleSessionExpiration() {
  let timer: NodeJS.Timeout;

  const resetTimer = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      // Aquí puedes implementar la lógica para cerrar la sesión
      // Por ejemplo, puedes usar la función handleSignOut que ya tienes
      import('@/lib/cognito-actions').then(({ handleSignOut }) => {
        handleSignOut();
      });
    }, 30 * 60 * 1000); // 30 minutos
  };

  // Reiniciar el temporizador en cada actividad del usuario
  window.addEventListener('mousemove', resetTimer);
  window.addEventListener('keypress', resetTimer);

  // Iniciar el temporizador
  resetTimer();

  // Función de limpieza
  return () => {
    if (timer) clearTimeout(timer);
    window.removeEventListener('mousemove', resetTimer);
    window.removeEventListener('keypress', resetTimer);
  };
}

// Componente para usar en _app.tsx o similar
export default function ConfigureAmplifyClientSide() {
  React.useEffect(() => {
    configureAmplifyClientSide();
    const cleanup = handleSessionExpiration();
    return cleanup;
  }, []);

  return null;
}