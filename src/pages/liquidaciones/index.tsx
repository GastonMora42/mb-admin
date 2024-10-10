import Layout from '@/components/layout';
import Liquidaciones from '@/components/liquidaciones/Liquidaciones';
import { RoleBasedAccess } from '@/components/RoleBasedAcces';

export default function LiquidacionesPage() {
  return (
    <Layout>
      <RoleBasedAccess allowedRoles={['Dueño']}>
      <Liquidaciones />
      </RoleBasedAccess>
    </Layout>
  );
}