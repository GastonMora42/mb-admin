import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styled from 'styled-components';

const PageContainer = styled.main`
  display: flex;
  min-height: 100vh;
  background-color: #1a202c;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 2rem;
`;

const LogoContainer = styled.div`
  margin-bottom: 2rem;
`;

const WelcomeCard = styled.div`
  background-color: #FFFFFF;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  max-width: 500px;
  width: 100%;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  color: #2D3748;
  margin-bottom: 1.5rem;
  text-align: center;
  font-weight: 600;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
`;

const Button = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  transition: all 0.3s ease;
  text-decoration: none;
  flex: 1;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  svg {
    margin-left: 0.5rem;
  }
`;

const LoginButton = styled(Button)`
  background-color: #FFC001;
  color: #1A202C;

  &:hover {
    background-color: #E6AC00;
  }
`;

const RegisterButton = styled(Button)`
  background-color: #2D3748;
  color: #FFFFFF;

  &:hover {
    background-color: #4A5568;
  }
`;

export default function Page() {
  return (
    <PageContainer>
      <ContentWrapper>
        <LogoContainer>
          <Image src="/mb-logo.png" alt="MB Academia de Danzas Logo" width={200} height={80} />
        </LogoContainer>
        <WelcomeCard>
          <Title>Bienvenido al panel de Administradores de MB Academia de Danzas</Title>
          <ButtonContainer>
            <LoginButton href="/login">
              Iniciar sesión
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4.16666 10H15.8333" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 4.16667L15.8333 10L10 15.8333" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </LoginButton>
            <RegisterButton href="/register">
              Registrarse
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 4.16667V15.8333" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4.16666 10H15.8333" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </RegisterButton>
          </ButtonContainer>
        </WelcomeCard>
      </ContentWrapper>
    </PageContainer>
  );
}