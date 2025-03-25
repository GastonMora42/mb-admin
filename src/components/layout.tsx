//src/components/layout.tsx
import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import dynamic from 'next/dynamic';
import Image from 'next/image';

const Navbar = dynamic(() => import('@/components/navBar'), { ssr: false });

// Main Container
const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
`;

// Content area that holds sidebar and main content
const Content = styled.div`
  display: flex;
  flex: 1;
  position: relative;
`;

// Sidebar with responsive behavior
const Sidebar = styled.div<{ isOpen: boolean }>`
  width: 280px;
  background-color: #1a202c;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  overflow-y: auto;
  height: calc(100vh - 60px);
  position: sticky;
  top: 60px;
  padding: 24px 16px;
  
  /* Custom scrollbar for sidebar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #2d3748;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #4a5568;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #718096;
  }

  @media (max-width: 1024px) {
    position: fixed;
    left: ${props => props.isOpen ? '0' : '-280px'};
    height: calc(100vh - 60px);
    z-index: 1000;
    top: 60px;
    padding-bottom: 100px; /* Extra padding for mobile scroll */
  }
  
  @media (max-width: 768px) {
    width: 260px;
  }
`;

// Main content area
const Main = styled.main<{ sidebarOpen: boolean }>`
  flex: 1;
  padding: 32px;
  background-color: #F7FAFC;
  overflow-y: auto;
  transition: all 0.3s ease;
  min-height: calc(100vh - 60px);

  @media (max-width: 1024px) {
    width: 100%;
    margin-left: 0;
    padding: 24px;
  }

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

// Logo container with responsive adjustments
const LogoContainer = styled.div`
  margin-bottom: 32px;
  text-align: center;
  padding: 0 12px;

  @media (max-width: 768px) {
    margin-bottom: 24px;
  }
`;

// Navigation sections for grouping menu items
const NavSection = styled.div`
  margin-bottom: 24px;
  
  &:not(:first-of-type) {
    border-top: 1px solid #2d3748;
    padding-top: 16px;
  }
`;

const SectionTitle = styled.h3`
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #718096;
  margin-bottom: 12px;
  padding: 0 16px;
  letter-spacing: 0.05em;
`;

// Styled navigation link with active state
const StyledLink = styled.a<{ isActive: boolean }>`
  color: ${props => props.isActive ? '#FFC001' : '#A0AEC0'};
  text-decoration: none;
  padding: 10px 16px;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-weight: 500;
  display: flex;
  align-items: center;
  margin-bottom: 4px;
  font-size: 0.95rem;
  position: relative;

  &:hover {
    background-color: #2D3748;
    color: #FFFFFF;
  }

  ${props => props.isActive && `
    background-color: #2D3748;
    color: #FFC001;
    box-shadow: 0 2px 5px rgba(255, 192, 1, 0.2);
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 60%;
      background-color: #FFC001;
      border-radius: 0 4px 4px 0;
    }
  `}

  svg {
    margin-right: 12px;
    min-width: 20px;
    transition: transform 0.2s ease;
  }
  
  &:hover svg {
    transform: translateX(2px);
  }

  @media (max-width: 768px) {
    padding: 12px 16px;
    font-size: 0.9rem;
  }
`;

// Toggle button for sidebar on mobile
const MenuButton = styled.button`
  display: none;
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1001;
  background-color: #FFC001;
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  cursor: pointer;
  color: #1a202c;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 12px rgba(0,0,0,0.4);
  }
  
  &:active {
    transform: scale(0.95);
  }

  @media (max-width: 1024px) {
    display: flex;
  }
`;

// Background overlay for mobile sidebar
const Overlay = styled.div<{ isOpen: boolean }>`
  display: none;
  position: fixed;
  top: 60px;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 999;
  opacity: ${props => props.isOpen ? 1 : 0};
  pointer-events: ${props => props.isOpen ? 'auto' : 'none'};
  transition: opacity 0.3s ease;
  backdrop-filter: blur(2px);

  @media (max-width: 1024px) {
    display: block;
  }
`;

// Menu icon with animation
const MenuIcon = styled.div<{ isOpen: boolean }>`
  width: 20px;
  height: 20px;
  position: relative;
  
  span {
    display: block;
    position: absolute;
    height: 3px;
    width: 100%;
    background: #1a202c;
    border-radius: 3px;
    opacity: 1;
    left: 0;
    transform: rotate(0deg);
    transition: 0.25s ease-in-out;
  }
  
  span:nth-child(1) {
    top: ${props => props.isOpen ? '50%' : '0px'};
    transform: ${props => props.isOpen ? 'rotate(135deg)' : 'rotate(0)'};
  }
  
  span:nth-child(2) {
    top: 50%;
    transform: translateY(-50%);
    opacity: ${props => props.isOpen ? '0' : '1'};
  }
  
  span:nth-child(3) {
    bottom: ${props => props.isOpen ? '50%' : '0px'};
    transform: ${props => props.isOpen ? 'rotate(-135deg)' : 'rotate(0)'};
  }
`;

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [key, setKey] = useState(0);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setKey(prev => prev + 1);
    
    // Close sidebar on mobile when route changes
    if (window.innerWidth <= 1024) {
      setIsSidebarOpen(false);
    }
    
    // Scroll to top when route changes
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [router.pathname]);
  
  // Handle initial mobile detection
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    
    // Set initial state
    handleResize();
    
    // Add resize listener
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (router.pathname === '/registro') {
    return <>{children}</>;
  }

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);
  const isLinkActive = (path: string) => 
    router.pathname === path || router.pathname.startsWith(`${path}/`);

  // Group navigation items by category
  const adminLinks = [
    { path: '/dashboard', name: 'Dashboard', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg> },
    { path: '/alumnos', name: 'Alumnos', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg> },
    { path: '/profesores', name: 'Profesores', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> },
    { path: '/estilos', name: 'Estilos', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg> },
    { path: '/conceptos', name: 'Conceptos', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg> },
  ];
  
  const operationLinks = [
    { path: '/asistencia', name: 'Asistencia', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> },
    { path: '/recibos', name: 'Recibos', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg> },
    { path: '/CtaCte', name: 'Cta. Cte.', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg> },
    { path: '/caja', name: 'Caja', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg> },
    { path: '/liquidaciones', name: 'Liquidaciones', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg> },
  ];
  
  const extraLinks = [
    { path: '/alumnos-sueltos-asistencia', name: 'Info Clases', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg> },
    { path: '/registro', name: 'Registro de Alumnos', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg> },
    { path: '/register83739666-', name: 'Crear Usuario', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg> },
  ];

  return (
    <Container>
      <Navbar />
      <Content>
        <Sidebar isOpen={isSidebarOpen}>
          <LogoContainer>
            <Image src="/mb-logo.png" alt="MB Admin Logo" width={180} height={60} priority />
          </LogoContainer>
          
          <NavSection>
            <SectionTitle>Administración</SectionTitle>
            {adminLinks.map(link => (
              <Link href={link.path} key={link.path} passHref>
                <StyledLink isActive={isLinkActive(link.path)} onClick={() => window.innerWidth <= 1024 && closeSidebar()}>
                  {link.icon}
                  {link.name}
                </StyledLink>
              </Link>
            ))}
          </NavSection>
          
          <NavSection>
            <SectionTitle>Operaciones</SectionTitle>
            {operationLinks.map(link => (
              <Link href={link.path} key={link.path} passHref>
                <StyledLink isActive={isLinkActive(link.path)} onClick={() => window.innerWidth <= 1024 && closeSidebar()}>
                  {link.icon}
                  {link.name}
                </StyledLink>
              </Link>
            ))}
          </NavSection>
          
          <NavSection>
            <SectionTitle>Extras</SectionTitle>
            {extraLinks.map(link => (
              <Link href={link.path} key={link.path} passHref>
                <StyledLink isActive={isLinkActive(link.path)} onClick={() => window.innerWidth <= 1024 && closeSidebar()}>
                  {link.icon}
                  {link.name}
                </StyledLink>
              </Link>
            ))}
          </NavSection>
        </Sidebar>
        
        <Overlay isOpen={isSidebarOpen} onClick={closeSidebar} />
        
        <Main key={key} sidebarOpen={isSidebarOpen} ref={mainRef}>
          {children}
        </Main>
        
        <MenuButton onClick={toggleSidebar} aria-label="Toggle Sidebar">
          <MenuIcon isOpen={isSidebarOpen}>
            <span></span>
            <span></span>
            <span></span>
          </MenuIcon>
        </MenuButton>
      </Content>
    </Container>
  );
};

export default Layout;