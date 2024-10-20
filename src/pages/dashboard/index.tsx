import Layout from '@/components/layout';
import styled from 'styled-components';
import { RoleBasedAccess } from '@/components/RoleBasedAcces';
import Dashboard from '@/components/dashboard/Dashboard'
import dynamic from 'next/dynamic'


const Title = styled.h1`
  color: #000000;
  margin-bottom: 20px;
`;

const Paragraph = styled.p`
  color: #333333;
`;

const DashboardWithNoSSR = dynamic(() => import('@/components/dashboard/Dashboard'), {
  ssr: false,
})

export default function Dashboards() {
  return (
    <Layout>
      <RoleBasedAccess allowedRoles={['Dueño']}>
       <DashboardWithNoSSR />
      </RoleBasedAccess>
    </Layout>
  );
}