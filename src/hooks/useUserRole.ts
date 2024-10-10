// hooks/useUserRole.ts
import { useState, useEffect } from 'react';
import { fetchUserAttributes } from 'aws-amplify/auth';

export function useUserRole() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    async function getUserRole() {
      try {
        const userAttributes = await fetchUserAttributes();
        setRole(userAttributes['custom:role'] || null);
      } catch (error) {
        console.error('Error getting user role:', error);
        setRole(null);
      }
    }

    getUserRole();
  }, []);

  return role;
}