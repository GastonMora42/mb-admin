import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import dynamic from 'next/dynamic';
import Image from 'next/image';

const Navbar = dynamic(() => import('@/components/navBar'), { ssr: false });

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const Content = styled.div`
  display: flex;
  flex: 1;
  overflow-y: auto;
  position: relative;
`;

const Sidebar = styled.div<{ isOpen: boolean }>`
  width: 280px;
  background-color: #1a202c;
  color: #ffffff;
  padding: 24px;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;

  @media (max-width: 1024px) {
    position: fixed;
    left: ${props => props.isOpen ? '0' : '-280px'};
    height: 100vh;
    z-index: 1000;
    padding-top: 60px;
  }
`;

const Main = styled.main<{ sidebarOpen: boolean }>`
  flex: 1;
  padding: 32px;
  background-color: #F7FAFC;
  overflow-y: auto;
  transition: margin-left 0.3s ease;

  @media (max-width: 1024px) {
    margin-left: ${props => props.sidebarOpen ? '280px' : '0'};
    width: 100%;
  }

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const LogoContainer = styled.div`
  margin-bottom: 40px;
  text-align: center;

  @media (max-width: 768px) {
    margin-bottom: 20px;
  }
`;

const StyledLink = styled.a<{ isActive: boolean }>`
  color: ${props => props.isActive ? '#FFC001' : '#A0AEC0'};
  text-decoration: none;
  padding: 12px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-weight: 500;
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 0.9rem;

  &:hover {
    background-color: #2D3748;
    color: #FFFFFF;
  }

  ${props => props.isActive && `
    background-color: #2D3748;
    color: #FFC001;
    box-shadow: 0 2px 5px rgba(255, 192, 1, 0.2);
  `}

  svg {
    margin-right: 12px;
    min-width: 20px;
  }

  @media (max-width: 768px) {
    padding: 10px 12px;
    margin-bottom: 4px;
  }
`;

const MenuButton = styled.button`
  display: none;
  position: fixed;
  top: 70px;
  left: 20px;
  z-index: 1001;
  background-color: #FFC001;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  color: #1a202c;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);

  @media (max-width: 1024px) {
    display: flex;
  }
`;

const Overlay = styled.div<{ isOpen: boolean }>`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  opacity: ${props => props.isOpen ? 1 : 0};
  pointer-events: ${props => props.isOpen ? 'auto' : 'none'};
  transition: opacity 0.3s ease;

  @media (max-width: 1024px) {
    display: block;
  }
`;

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    setKey(prev => prev + 1);
  }, [router.pathname]);

  if (router.pathname === '/registro') {
    return <>{children}</>;
  }

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);
  const isLinkActive = (path: string) => 
    router.pathname === path || router.pathname.startsWith(`${path}/`);

  return (
    <Container>
      <Navbar />
      <Content>
        <MenuButton onClick={toggleSidebar}>
          {isSidebarOpen ? '×' : '☰'}
        </MenuButton>
        <Overlay isOpen={isSidebarOpen} onClick={closeSidebar} />
        <Sidebar isOpen={isSidebarOpen}>
          <LogoContainer>
            <Image src="/mb-logo.png" alt="MB Admin Logo" width={180} height={60} />
          </LogoContainer>
          <Link href="/dashboard" passHref>
            <StyledLink isActive={isLinkActive('/dashboard')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              Dashboard
            </StyledLink>
          </Link>
          <Link href="/alumnos" passHref>
            <StyledLink isActive={isLinkActive('/alumnos')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              Alumnos
            </StyledLink>
          </Link>
          <Link href="/profesores" passHref>
            <StyledLink isActive={isLinkActive('/profesores')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              Profesores
            </StyledLink>
          </Link>
          <Link href="/asistencia" passHref>
            <StyledLink isActive={isLinkActive('/asistencia')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              Asistencia
            </StyledLink>
          </Link>
          <Link href="/estilos" passHref>
            <StyledLink isActive={isLinkActive('/estilos')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
              Estilos
            </StyledLink>
          </Link>
          <Link href="/conceptos" passHref>
            <StyledLink isActive={isLinkActive('/conceptos')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              Conceptos
            </StyledLink>
          </Link>
          <Link href="/recibos" passHref>
            <StyledLink isActive={isLinkActive('/recibos')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
              Recibos
            </StyledLink>
          </Link>
          <Link href="/CtaCte" passHref>
            <StyledLink isActive={isLinkActive('/CtaCte')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
              Cta. Cte.
            </StyledLink>
          </Link>
          <Link href="/caja" passHref>
            <StyledLink isActive={isLinkActive('/caja')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
              Caja
            </StyledLink>
          </Link>
          <Link href="/liquidaciones" passHref>
            <StyledLink isActive={isLinkActive('/liquidaciones')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
              Liquidaciones
            </StyledLink>
          </Link>
          <Link href="/alumnos-sueltos-asistencia" passHref>
            <StyledLink isActive={isLinkActive('/alumnos-sueltos-asistencia')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              Info Clases
            </StyledLink>
          </Link>
          <Link href="/registro" passHref>
            <StyledLink isActive={isLinkActive('/registro')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
              </svg>
              Registro de Alumnos
            </StyledLink>
          </Link>
          </Sidebar>
          <Main key={key} sidebarOpen={isSidebarOpen} onClick={() => isSidebarOpen && closeSidebar()}>
          {children}
        </Main>
      </Content>
    </Container>
  );
};

export default Layout;