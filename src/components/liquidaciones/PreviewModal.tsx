// components/Liquidaciones/PreviewModal.tsx
import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { PDFViewer, PDFDownloadLink, BlobProvider } from '@react-pdf/renderer';
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

// Interfaz común para recibos en liquidación
interface ReciboLiquidacion {
  id: number;
  numeroRecibo: number;
  fecha: string;
  monto: number;
  tipoPago?: string;
  alumno?: {
    id: number;
    nombre: string;
    apellido: string;
  } | null;
  concepto: {
    nombre: string;
    estilo?: string;
  };
  montoLiquidacion?: number;
  porcentajeAplicado?: number;
  tipoLiquidacion?: string;
}

interface LiquidacionData {
  regularCount: number;
  sueltasCount: number;
  clasesCount: number;
  totalRegular: number;
  totalSueltas: number;
  montoLiquidacionRegular: number;
  montoLiquidacionSueltas: number;
  recibos: ReciboLiquidacion[];
  periodo: string;
}

interface PreviewModalProps {
  liquidacionData: LiquidacionData;
  profesor: Profesor | null;
  porcentajesPersonalizados: {
    porcentajeCursos: number;
    porcentajeClasesSueltas: number;
  };
  onClose: () => void;
}

// Interfaz para el estado del PDFDownloadLink
interface PDFDownloadLinkState {
  blob: Blob | null;
  url: string | null;
  loading: boolean;
  error: Error | null;
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

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary'; disabled?: boolean }>`
  padding: 10px 20px;
  border-radius: 4px;
  border: none;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  font-weight: 500;
  transition: all 0.2s ease;
  opacity: ${props => props.disabled ? 0.7 : 1};
  
  ${props => props.variant === 'primary' ? `
    background-color: #FFC001;
    color: #000;
    
    &:hover {
      background-color: ${props.disabled ? '#FFC001' : '#e6ac00'};
    }
  ` : `
    background-color: #f0f0f0;
    color: #333;
    
    &:hover {
      background-color: ${props.disabled ? '#f0f0f0' : '#e0e0e0'};
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

// Añadir un nuevo styled component para ocultar el PDFDownloadLink default
const HiddenDownloadLink = styled.div`
  display: none;
`;

// Versión con BlobProvider
export const PreviewModal: React.FC<PreviewModalProps> = ({
  liquidacionData,
  profesor,
  porcentajesPersonalizados,
  onClose
}) => {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleDownload = async (blob: Blob) => {
    // Crear un objeto URL para el blob
    const url = URL.createObjectURL(blob);
    
    // Crear un elemento a temporal
    const link = document.createElement('a');
    link.href = url;
    link.download = `liquidacion_${
      profesor ? `${profesor.apellido}_${profesor.nombre}_` : ''
    }${liquidacionData.periodo.replace('-', '_')}.pdf`;
    
    // Añadir al DOM, hacer clic y luego eliminar
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Liberar el objeto URL
    setTimeout(() => URL.revokeObjectURL(url), 100);
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
          
          <BlobProvider
            document={
              <LiquidacionPDF
                liquidacionData={liquidacionData}
                profesor={profesor}
                porcentajesPersonalizados={porcentajesPersonalizados}
              />
            }
          >
            {({ blob, loading, error }) => (
              <ActionButton 
                variant="primary" 
                onClick={() => blob && handleDownload(blob)}
                disabled={loading || !blob || !!error}
              >
                {loading ? 'Preparando PDF...' : 'Descargar PDF'}
              </ActionButton>
            )}
          </BlobProvider>
        </ModalActions>
      </ModalContent>
    </ModalOverlay>
  );
};