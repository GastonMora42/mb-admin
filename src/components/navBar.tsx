import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { handleSignOut } from '@/lib/cognito-actions';
import { Hub } from 'aws-amplify/utils';
import { fetchUserAttributes, getCurrentUser } from 'aws-amplify/auth';

const NavbarContainer = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
  background-color: #1a202c;
  color: #FFFFFF;
  height: 60px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const WelcomeMessage = styled.div`
  font-size: 1.1rem;
  font-weight: 500;
  color: #A0AEC0;
  span {
    color: #FFC001;
    font-weight: 600;
  }
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
  padding: 8px 16px;
  border-radius: 4px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;

  &:hover {
    background-color: #2D3748;
  }

  svg {
    margin-left: 8px;
    transition: transform 0.3s ease;
  }

  &:hover svg {
    transform: translateY(2px);
  }
`;

const DropdownMenu = styled.div<{ isOpen: boolean }>`
  position: absolute;
  right: 0;
  top: 120%;
  background-color: #2D3748;
  border: 1px solid #4A5568;
  border-radius: 8px;
  padding: 0.5rem;
  display: ${props => props.isOpen ? 'block' : 'none'};
  z-index: 1000;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  opacity: ${props => props.isOpen ? 1 : 0};
  transform: translateY(${props => props.isOpen ? '0' : '-10px'});
  transition: opacity 0.3s ease, transform 0.3s ease;
`;

const DropdownItem = styled.button`
  background: none;
  border: none;
  padding: 12px 24px;
  width: 100%;
  text-align: left;
  cursor: pointer;
  color: #E2E8F0;
  transition: all 0.3s ease;
  border-radius: 4px;

  &:hover {
    background-color: #4A5568;
    color: #FFC001;
  }
`;

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        const userAttributes = await fetchUserAttributes();
        setUserName(userAttributes.name || currentUser.username);
      } catch (error) {
        console.error('Error al obtener el usuario:', error);
      }
    };

    fetchUser();

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
      }
    } catch (error) {
      console.error('Error inesperado al cerrar sesión:', error);
    }
  };

  return (
    <NavbarContainer>
      <WelcomeMessage>Bienvenid@ de vuelta, <span>{userName}</span></WelcomeMessage>
      <DropdownContainer>
        <DropdownButton onClick={() => setIsOpen(!isOpen)}>
          Menú
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L6 6L11 1" stroke="#FFC001" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </DropdownButton>
        <DropdownMenu isOpen={isOpen}>
          <DropdownItem onClick={logout}>Cerrar Sesión</DropdownItem>
        </DropdownMenu>
      </DropdownContainer>
    </NavbarContainer>
  );
};

export default Navbar;