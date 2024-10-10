import Layout from '@/components/layout';
import CtaCte from '@/components/ctacte/CtaCte';
import { RoleBasedAccess } from '@/components/RoleBasedAcces';

export default function CtaCtePage() {
  return (
    <Layout>
      <RoleBasedAccess allowedRoles={['Dueño', 'Secretaria']}>
      <CtaCte />
      </RoleBasedAccess>
    </Layout>
  );
}