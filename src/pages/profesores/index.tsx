import Layout from '@/components/layout';
import Profesores from '@/components/profesores/Profesores';
import { RoleBasedAccess } from '@/components/RoleBasedAcces';

export default function ProfesoresPage() {
  return (
    <Layout>
      <RoleBasedAccess allowedRoles={['Dueño']}>
      <Profesores />
      </RoleBasedAccess>
    </Layout>
  );
}