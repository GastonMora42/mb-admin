import Layout from '@/components/layout';
import Estilos from '@/components/estilos/Estilos';
import { RoleBasedAccess } from '@/components/RoleBasedAcces';

export default function EstilosPage() {
  return (
    <Layout>
      <RoleBasedAccess allowedRoles={['Dueño']}>
      <Estilos />
      </RoleBasedAccess>
    </Layout>
  );
}