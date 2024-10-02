"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { handleSignOut } from '@/lib/cognito-actions';
import { Button } from '@/components/button';

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const onSignOut = async () => {
    setIsLoading(true);
    setError('');

    try {
      const result = await handleSignOut();
      if (result.success) {
        router.push(result.redirectTo || '/login');
      } else {
        setError(result.error || 'Error al cerrar sesión');
      }
    } catch (err) {
      setError('Ocurrió un error inesperado al cerrar sesión');
      console.error('Error al cerrar sesión:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p className="mb-4">Bienvenido a tu dashboard</p>
      
      <Button
        onClick={onSignOut}
        disabled={isLoading}
        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
      >
        {isLoading ? 'Cerrando sesión...' : 'Cerrar sesión'}
      </Button>

      {error && (
        <p className="text-red-500 mt-2">{error}</p>
      )}
    </div>
  );
}