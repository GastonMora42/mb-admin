// src/amplify-cognito-config.ts
import { Amplify, type ResourcesConfig } from "aws-amplify";
import React from "react";
import dotenv from 'dotenv';
dotenv.config();

export const authConfig: ResourcesConfig["Auth"] = { 
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
    
    // Usar tipo any para evitar errores de TypeScript
    Amplify.configure(
      {
        Auth: authConfig,
      } as any,
      { ssr: false }
    );
    
    // Configurar manejo de sesión mejorado
    configureSessionHandling();
  }
}

// Función para configurar manejo de sesión mejorado
function configureSessionHandling() {
  // Implementar verificación periódica de la sesión
  const sessionCheckInterval = setInterval(async () => {
    try {
      const { fetchAuthSession } = await import('aws-amplify/auth');
      await fetchAuthSession();
      console.log('Sesión verificada correctamente');
    } catch (error) {
      console.error('Error en verificación de sesión:', error);
      
      try {
        const { fetchAuthSession } = await import('aws-amplify/auth');
        // Intentar refrescar la sesión
        await fetchAuthSession({ forceRefresh: true });
      } catch (refreshError) {
        console.error('No se pudo refrescar la sesión:', refreshError);
        // La sesión no se pudo refrescar, se podría redirigir al login
        // window.location.href = '/login';
      }
    }
  }, 5 * 60 * 1000); // Verificar cada 5 minutos

  // Devolver función de limpieza
  return () => {
    clearInterval(sessionCheckInterval);
  };
}

// Función para manejar la caducidad de la sesión
function handleSessionExpiration() {
  let timer: NodeJS.Timeout;

  const resetTimer = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      import('@/lib/cognito-actions').then(({ handleSignOut }) => {
        handleSignOut();
      });
    }, 30 * 60 * 1000); // 30 minutos
  };

  if (typeof window !== 'undefined') {
    // Eventos para detectar actividad del usuario
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keypress', resetTimer);
    window.addEventListener('touchstart', resetTimer);
    window.addEventListener('scroll', resetTimer);
    
    // Iniciar el temporizador
    resetTimer();
  }

  // Función de limpieza
  return () => {
    if (timer) clearTimeout(timer);
    if (typeof window !== 'undefined') {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keypress', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
      window.removeEventListener('scroll', resetTimer);
    }
  };
}

// Componente para usar en _app.tsx o similar
export default function ConfigureAmplifyClientSide() {
  React.useEffect(() => {
    configureAmplifyClientSide();
    const cleanupSessionExpiration = handleSessionExpiration();
    
    return () => {
      cleanupSessionExpiration();
    };
  }, []);

  return null;
}