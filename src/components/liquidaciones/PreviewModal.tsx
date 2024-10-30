// components/Liquidaciones/PreviewModal.tsx
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { PDFViewer } from '@react-pdf/renderer';
import LiquidacionPDF from './LiquidacionPDF';

// Interfaces
interface Profesor {
  id: number;
  nombre: string;
  apellido: string;
  porcentajePorDefecto: number;
  porcentajeClasesSueltasPorDefecto: number;
}

interface PorcentajesPersonalizados {
  porcentajeCursos: number;
  porcentajeClasesSueltas: number;
}

interface LiquidacionData {
  periodo: string;
  regularCount: number;
  sueltasCount: number;
  totalRegular: number;
  totalSueltas: number;
  montoLiquidacionRegular: number;
  montoLiquidacionSueltas: number;
  recibos: any[];
}

// En PreviewModal.tsx, actualiza la interfaz:
interface PreviewModalProps {
  liquidacionData: LiquidacionData;
  profesor: Profesor | null | undefined;  // Actualizado para aceptar null
  porcentajesPersonalizados: PorcentajesPersonalizados;
  onClose: () => void;
}

// Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  width: 95%;
  height: 95vh;
  border-radius: 8px;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ModalHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 5px;
  
  &:hover {
    color: #000;
  }
`;

const PDFContainer = styled.div`
  flex: 1;
  overflow: hidden;
  
  /* Estilo para el visor de PDF */
  & > iframe {
    width: 100%;
    height: 100%;
    border: none;
  }
`;

const ModalActions = styled.div`
  padding: 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 10px 20px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  
  ${props => props.variant === 'primary' ? `
    background-color: #FFC001;
    color: #000;
    
    &:hover {
      background-color: #e6ac00;
    }
  ` : `
    background-color: #f0f0f0;
    color: #333;
    
    &:hover {
      background-color: #e0e0e0;
    }
  `}
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #666;
`;

const PreviewModal: React.FC<PreviewModalProps> = ({
  liquidacionData,
  profesor,
  porcentajesPersonalizados,
  onClose
}) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular tiempo de carga del PDF
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleDownload = () => {
    // La descarga se maneja automáticamente por el componente PDF
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Vista Previa de Liquidación</ModalTitle>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>

        <PDFContainer>
          {isLoading ? (
            <LoadingContainer>
              Cargando vista previa...
            </LoadingContainer>
          ) : (
            <PDFViewer style={{ width: '100%', height: '100%' }}>
              <LiquidacionPDF
                liquidacionData={liquidacionData}
                profesor={profesor}
                porcentajesPersonalizados={porcentajesPersonalizados}
              />
            </PDFViewer>
          )}
        </PDFContainer>

        <ModalActions>
          <ActionButton 
            variant="secondary" 
            onClick={onClose}
          >
            Cancelar
          </ActionButton>
          <ActionButton 
            variant="primary" 
            onClick={handleDownload}
          >
            Descargar PDF
          </ActionButton>
        </ModalActions>
      </ModalContent>
    </ModalOverlay>
  );
};

export default PreviewModal;