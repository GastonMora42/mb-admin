import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #F9F8F8;
`;

const Navbar = styled.nav`
  width: 250px;
  background-color: #000000;
  padding: 20px;
`;

const NavLink = styled(Link)`
  display: block;
  margin-bottom: 15px;
  color: #FFFFFF;
  text-decoration: none;
  font-size: 16px;
  padding: 10px;
  border-radius: 5px;
  transition: background-color 0.3s;

  &:hover {
    background-color: #FFC001;
    color: #000000;
  }
`;

const Main = styled.main`
  flex: 1;
  padding: 40px;
`;

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Container>
      <Navbar>
        <NavLink href="/alumnos">Alumnos</NavLink>
        <NavLink href="/conceptos">Conceptos</NavLink>
        <NavLink href="/recibos">Recibos</NavLink>
        <NavLink href="/estilos">Estilos</NavLink>
        <NavLink href="/profesores">Profesores</NavLink>
        <NavLink href="/cta-cte">Cta. Cte.</NavLink>
        <NavLink href="/liquidaciones">Liquidaciones</NavLink>
        <NavLink href="/caja-diaria">Caja Diaria</NavLink>
      </Navbar>
      <Main>{children}</Main>
    </Container>
  );
};

export default Layout;