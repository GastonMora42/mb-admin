import Layout from '@/components/layout';
import Alumnos from '@/components/alumnos/Alumnos';
import { RoleBasedAccess } from '@/components/RoleBasedAcces';

export default function AlumnosPage() {
  return (
    <Layout>
      <RoleBasedAccess allowedRoles={['Dueño', 'Secretaria']}>
      <Alumnos />
      </RoleBasedAccess>
    </Layout>
  );
}