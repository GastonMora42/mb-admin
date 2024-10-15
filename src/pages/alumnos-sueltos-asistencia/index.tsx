import Layout from '@/components/layout';
import AlumnosSueltosAsistencia from '@/components/alumnos-sueltos-asistencia/AlumnosSueltosAsistencia';
import { RoleBasedAccess } from '@/components/RoleBasedAcces';

export default function AlumnosSueltosAsistenciaPage() {
  return (
    <Layout>
      <RoleBasedAccess allowedRoles={['Dueño']}>
        <AlumnosSueltosAsistencia />
      </RoleBasedAccess>
    </Layout>
  );
}