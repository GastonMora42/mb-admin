import { AlumnoEstilo } from '@/types/alumnos-estilos';
import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from '../button';

const EstilosContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const EstiloItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2em;
`;

const EstilosList = styled.div`
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease-out;

  &.open {
    max-height: 500px; // Ajusta este valor según sea necesario
  }
`;

interface EstilosProps {
  alumnoEstilos: AlumnoEstilo[];
  onEstiloToggle: (alumnoId: number, estiloId: number, activo: boolean) => void;
  alumnoId: number;
}

const EstilosComponent: React.FC<EstilosProps> = ({ alumnoEstilos, onEstiloToggle, alumnoId }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <EstilosContainer>
      <EstiloItem>
        <span>{alumnoEstilos.length} estilo(s)</span>
        <ToggleButton onClick={() => setIsOpen(!isOpen)}>{isOpen ? '▲' : '▼'}</ToggleButton>
      </EstiloItem>
      <EstilosList className={isOpen ? 'open' : ''}>
        {alumnoEstilos.map(ae => (
          <EstiloItem key={ae.estilo.id}>
            <span>{ae.estilo.nombre}</span>
            <Button onClick={() => onEstiloToggle(alumnoId, ae.estilo.id, !ae.activo)}>
              {ae.activo ? 'Dar de Baja' : 'Reactivar'}
            </Button>
          </EstiloItem>
        ))}
      </EstilosList>
    </EstilosContainer>
  );
};

export default EstilosComponent;