import Layout from '@/components/layout';
import Recibos from '@/components/recibos/Recibos';
import { RoleBasedAccess } from '@/components/RoleBasedAcces';

export default function RecibosPage() {
  return (
    <Layout>
      <RoleBasedAccess allowedRoles={['Dueño', 'Secretaria']}>
      <Recibos />
      </RoleBasedAccess>
    </Layout>
  );
}