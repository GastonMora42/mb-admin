// components/RoleBasedAccess.tsx
import { ReactNode } from 'react';
import { useUserRole } from '../hooks/useUserRole';

interface RoleBasedAccessProps {
  allowedRoles: string[];
  children: ReactNode;
}

export function RoleBasedAccess({ allowedRoles, children }: RoleBasedAccessProps) {
  const userRole = useUserRole();

  if (!userRole || !allowedRoles.includes(userRole)) {
    return null;
  }

  return <>{children}</>;
}