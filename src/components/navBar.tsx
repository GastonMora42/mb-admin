import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { handleSignOut } from '@/lib/cognito-actions';
import { Hub } from 'aws-amplify/utils';
import { fetchUserAttributes, getCurrentUser } from 'aws-amplify/auth';

const NavbarContainer = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1.5rem;
  background-color: #1a202c;
  color: #FFFFFF;
  height: 60px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
  
  @media (max-width: 768px) {
    padding: 0 1rem;
    height: 56px;
  }
`;

const Logo = styled.div`
  font-size: 1.3rem;
  font-weight: 700;
  color: #FFC001;
  display: flex;
  align-items: center;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const WelcomeMessage = styled.div`
  font-size: 1.1rem;
  font-weight: 500;
  color: #A0AEC0;
  margin-left: 16px;
  
  span {
    color: #FFC001;
    font-weight: 600;
  }
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
    display: none;
  }
  
  @media (max-width: 1024px) {
    display: none;
  }
`;

const NavbarContent = styled.div`
  display: flex;
  align-items: center;
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

  &:hover, &:focus {
    background-color: #2D3748;
    outline: none;
  }

  svg {
    margin-left: 8px;
    transition: transform 0.3s ease;
  }

  &:hover svg, &:focus svg {
    transform: translateY(2px);
  }
  
  @media (max-width: 768px) {
    padding: 8px 10px;
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
  min-width: 180px;
  
  @media (max-width: 768px) {
    right: -10px;
    min-width: 160px;
  }
`;

const DropdownItem = styled.button`
  background: none;
  border: none;
  padding: 12px 16px;
  width: 100%;
  text-align: left;
  cursor: pointer;
  color: #E2E8F0;
  transition: all 0.3s ease;
  border-radius: 4px;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 10px;

  &:hover {
    background-color: #4A5568;
    color: #FFC001;
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  
  @media (max-width: 1024px) {
    display: none;
  }
`;

const NavLink = styled.a`
  color: #E2E8F0;
  margin-right: 24px;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  padding: 6px 0;
  position: relative;
  transition: color 0.3s ease;
  
  &:hover, &.active {
    color: #FFC001;
  }
  
  &::after {
    content: '';
    position: absolute;
    width: 0;
    height: 2px;
    bottom: 0;
    left: 0;
    background-color: #FFC001;
    transition: width 0.3s ease;
  }
  
  &:hover::after, &.active::after {
    width: 100%;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: #FFFFFF;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 5px;
  
  @media (max-width: 1024px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const MobileMenu = styled.div<{ isOpen: boolean }>`
  display: none;
  position: fixed;
  top: 60px;
  left: 0;
  right: 0;
  background-color: #1a202c;
  padding: 1rem;
  transform: translateY(${props => props.isOpen ? '0' : '-100%'});
  opacity: ${props => props.isOpen ? 1 : 0};
  transition: transform 0.3s ease, opacity 0.3s ease;
  z-index: 999;
  border-top: 1px solid #2D3748;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 1024px) {
    display: block;
  }
  
  @media (max-width: 768px) {
    top: 56px;
  }
`;

const MobileNavLink = styled.a`
  display: block;
  color: #E2E8F0;
  padding: 12px 16px;
  text-decoration: none;
  font-weight: 500;
  border-radius: 4px;
  margin-bottom: 8px;
  transition: background-color 0.3s ease;
  
  &:hover, &.active {
    background-color: #2D3748;
    color: #FFC001;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-top: 1px solid #2D3748;
  margin-top: 8px;
  
  span {
    color: #FFC001;
    font-weight: 600;
    margin-left: 4px;
  }
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #FFC001;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1a202c;
  font-weight: 600;
  margin-right: 12px;
`;

const Navbar: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [userInitials, setUserInitials] = useState('');
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        const userAttributes = await fetchUserAttributes();
        const name = userAttributes.name || currentUser.username;
        setUserName(name);
        
        // Get initials from name (first letter of first and last name)
        const initials = name
          .split(' ')
          .map(part => part.charAt(0))
          .join('')
          .toUpperCase()
          .substring(0, 2);
        
        setUserInitials(initials);
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

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      listener();
      document.removeEventListener('mousedown', handleClickOutside);
    };
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
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <NavbarContainer>
        <NavbarContent>
          <MobileMenuButton onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? (
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            )}
          </MobileMenuButton>
        </NavbarContent>
        
        <NavbarContent>
          <WelcomeMessage>Bienvenid@ de vuelta, <span>{userName}</span></WelcomeMessage>
          <DropdownContainer ref={dropdownRef}>
            <DropdownButton onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              <Avatar>{userInitials}</Avatar>
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L6 6L11 1" stroke="#FFC001" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </DropdownButton>
            <DropdownMenu isOpen={isDropdownOpen}>
              <DropdownItem onClick={logout}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Cerrar Sesión
              </DropdownItem>
            </DropdownMenu>
          </DropdownContainer>
        </NavbarContent>
      </NavbarContainer>
      
      <MobileMenu isOpen={isMobileMenuOpen} ref={mobileMenuRef}>
        
        <UserInfo>
          Bienvenid@ de vuelta, <span>{userName}</span>
        </UserInfo>
        
        <MobileNavLink href="#" onClick={logout}>
          Cerrar Sesión
        </MobileNavLink>
      </MobileMenu>
    </>
  );
};

export default Navbar;