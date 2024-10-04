import Layout from '@/components/layout';
import styled from 'styled-components';

const Title = styled.h1`
  color: #000000;
  margin-bottom: 20px;
`;

const Paragraph = styled.p`
  color: #333333;
`;

export default function Dashboard() {
  return (
    <Layout>
      <Title>Dashboard</Title>
      <Paragraph>Selecciona una opción de la barra de navegación.</Paragraph>
    </Layout>
  );
}