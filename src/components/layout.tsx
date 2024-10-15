import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import dynamic from 'next/dynamic';

const Navbar = dynamic(() => import('@/components/navBar'), { ssr: false });

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const Content = styled.div`
  display: flex;
  flex: 1;
`;

const Sidebar = styled.nav`
  width: 250px;
  background-color: #F9F8F8;
  padding: 20px;
  height: calc(100vh - 60px); // Resta la altura del navbar
  overflow-y: auto;
`;

const Main = styled.main`
  flex: 1;
  padding: 20px;
  background-color: #FFFFFF;
`;

const NavLink = styled.a`
  display: block;
  margin-bottom: 10px;
  color: #000000;
  text-decoration: none;
  padding: 10px;
  border-radius: 5px;
  transition: background-color 0.3s;

  &:hover {
    background-color: #FFC001;
  }
`;

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Container>
      <Navbar />
      <Content>
        <Sidebar>
        <Link href="/dashboard" passHref legacyBehavior>
            <NavLink>Dashboard</NavLink>
          </Link>
          <Link href="/alumnos" passHref legacyBehavior>
            <NavLink>Alumnos</NavLink>
          </Link>
          <Link href="/profesores" passHref legacyBehavior>
            <NavLink>Profesores</NavLink>
          </Link>
          <Link href="/asistencia" passHref legacyBehavior>
            <NavLink>Asistencia</NavLink>
          </Link>
          <Link href="/estilos" passHref legacyBehavior>
            <NavLink>Estilos</NavLink>
          </Link>
          <Link href="/conceptos" passHref legacyBehavior>
            <NavLink>Conceptos</NavLink>
          </Link>
          <Link href="/recibos" passHref legacyBehavior>
            <NavLink>Recibos</NavLink>
          </Link>
          <Link href="/CtaCte" passHref legacyBehavior>
            <NavLink>Cta. Cte.</NavLink>
          </Link>
          <Link href="/caja" passHref legacyBehavior>
            <NavLink>Caja</NavLink>
          </Link>
          <Link href="/liquidaciones" passHref legacyBehavior>
            <NavLink>Liquidaciones</NavLink>
          </Link>
          <Link href="/alumnos-sueltos-asistencia" passHref legacyBehavior>
            <NavLink>Info Clases</NavLink>
          </Link>
        </Sidebar>
        <Main>{children}</Main>
      </Content>
    </Container>
  );
};

export default Layout;