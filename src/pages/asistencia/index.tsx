import Layout from '@/components/layout';
import TomarAsistencia from '@/components/asistencia/TomarAsistencia';
import { RoleBasedAccess } from '@/components/RoleBasedAcces';

export default function AsistenciaPage() {
  return (
    <Layout>
      <RoleBasedAccess allowedRoles={['Dueño', 'Profesor']}>
      <TomarAsistencia />
      </RoleBasedAccess>
    </Layout>
  );
}