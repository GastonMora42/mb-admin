import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { handleSignOut } from '@/lib/cognito-actions';
import { Hub } from 'aws-amplify/utils';

const NavbarContainer = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 2rem;
  background-color: #000000;
  color: #FFFFFF;
  height: 60px;
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
`;

const DropdownContainer = styled.div`
  position: relative;
`;

const DropdownButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  color: #FFFFFF;
`;

const DropdownMenu = styled.div<{ isOpen: boolean }>`
  position: absolute;
  right: 0;
  top: 100%;
  background-color: #FFFFFF;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 0.5rem;
  display: ${props => props.isOpen ? 'block' : 'none'};
  z-index: 1000;
`;

const DropdownItem = styled.button`
  background: none;
  border: none;
  padding: 0.5rem;
  width: 100%;
  text-align: left;
  cursor: pointer;
  color: #000000;
  &:hover {
    background-color: #FFC001;
  }
`;


const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const listener = Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'signedOut':
        case 'tokenRefresh_failure':
          router.push('/login');
          break;
      }
    });

    return () => listener();
  }, [router]);

  const logout = async () => {
    try {
      const result = await handleSignOut();
      if (result.success) {
        router.push('/login');
      } else {
        console.error('Error al cerrar sesión:', result.error);
        // Aquí puedes manejar el error, por ejemplo, mostrando un mensaje al usuario
      }
    } catch (error) {
      console.error('Error inesperado al cerrar sesión:', error);
      // Manejo de errores inesperados
    }
  };

  return (
    <NavbarContainer>
      <Logo>Mi App</Logo>
      <DropdownContainer>
        <DropdownButton onClick={() => setIsOpen(!isOpen)}>
          Menú ▼
        </DropdownButton>
        <DropdownMenu isOpen={isOpen}>
          <DropdownItem onClick={logout}>Cerrar Sesión</DropdownItem>
        </DropdownMenu>
      </DropdownContainer>
    </NavbarContainer>
  );
};

export default Navbar;