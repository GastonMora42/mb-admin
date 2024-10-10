import Layout from '@/components/layout';
import Conceptos from '@/components/conceptos/Conceptos';
import { RoleBasedAccess } from '@/components/RoleBasedAcces';

export default function ConceptosPage() {
  return (
    <Layout>
      <RoleBasedAccess allowedRoles={['Dueño', 'Secretaria']}>
      <Conceptos />
      </RoleBasedAccess>
    </Layout>
  );
}