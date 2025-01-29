import Layout from '@/components/layout';
import CajaDiaria from '@/components/caja/CajaDiaria';
import { RoleBasedAccess } from '@/components/RoleBasedAcces';

export default function CajaDiariaPage() {
  return (
    <Layout>
      <RoleBasedAccess allowedRoles={['Dueño', 'Secretaria']}>
      <CajaDiaria />
      </RoleBasedAccess>
    </Layout>
  );
}