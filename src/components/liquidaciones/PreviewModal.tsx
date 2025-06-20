import React, { useEffect, useState } from 'react';
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

interface ConfiguracionLiquidacion {
  tipoRegular: 'PORCENTAJE' | 'MONTO_FIJO';
  tipoSueltas: 'PORCENTAJE' | 'MONTO_FIJO';
  porcentajeRegular: number;
  porcentajeSueltas: number;
  montoFijoRegular: number;
  montoFijoSueltas: number;
}

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
  configuracion: ConfiguracionLiquidacion;
  onClose: () => void;
}

// Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: white;
  width: 100%;
  height: 95vh;
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  
  @media (min-width: 768px) {
    width: 95%;
    max-width: 1200px;
  }
`;

const ModalHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f9fafb;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: #111827;
  font-size: 1.25rem;
  font-weight: 600;
  
  @media (min-width: 768px) {
    font-size: 1.5rem;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  
  &:hover {
    color: #374151;
    background: #e5e7eb;
  }
`;

const PDFContainer = styled.div`
  flex: 1;
  overflow: hidden;
  background: #f3f4f6;
  
  iframe {
    width: 100%;
    height: 100%;
    border: none;
  }
`;

const ModalActions = styled.div`
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  background: #f9fafb;
  flex-direction: column;
  
  @media (min-width: 640px) {
    flex-direction: row;
  }
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary'; disabled?: boolean }>`
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  border: none;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  font-weight: 600;
  transition: all 0.2s ease;
  opacity: ${props => props.disabled ? 0.5 : 1};
  font-size: 0.875rem;
  
  ${props => props.variant === 'primary' ? `
    background-color: #FFC001;
    color: #1f2937;
    
    &:hover:not(:disabled) {
      background-color: #e6ac00;
      transform: translateY(-1px);
    }
  ` : `
    background-color: #f3f4f6;
    color: #374151;
    border: 1px solid #d1d5db;
    
    &:hover:not(:disabled) {
      background-color: #e5e7eb;
    }
  `}
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #6b7280;
  flex-direction: column;
  gap: 1rem;
`;

const LoadingSpinner = styled.div`
  width: 3rem;
  height: 3rem;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #FFC001;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #dc2626;
  text-align: center;
  padding: 2rem;
`;

export const PreviewModal: React.FC<PreviewModalProps> = ({
  liquidacionData,
  profesor,
  configuracion,
  onClose
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleDownload = async (blob: Blob) => {
    try {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `liquidacion_${
        profesor ? `${profesor.apellido}_${profesor.nombre}_` : ''
      }${liquidacionData.periodo.replace('-', '_')}.pdf`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (err) {
      setError('Error al descargar el archivo');
      console.error('Error downloading:', err);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Preparar datos para el PDF con la configuración actual
  const pdfData = {
    ...liquidacionData,
    configuracion: {
      tipoRegular: configuracion.tipoRegular,
      tipoSueltas: configuracion.tipoSueltas,
      valorRegular: configuracion.tipoRegular === 'MONTO_FIJO' 
        ? configuracion.montoFijoRegular 
        : configuracion.porcentajeRegular,
      valorSueltas: configuracion.tipoSueltas === 'MONTO_FIJO' 
        ? configuracion.montoFijoSueltas 
        : configuracion.porcentajeSueltas
    }
  };

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            Vista Previa - Liquidación {profesor ? `${profesor.apellido}, ${profesor.nombre}` : ''}
          </ModalTitle>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>

        <PDFContainer>
          {error ? (
            <ErrorContainer>
              <div>
                <h3>Error al generar la vista previa</h3>
                <p>{error}</p>
                <ActionButton onClick={() => setError(null)}>
                  Reintentar
                </ActionButton>
              </div>
            </ErrorContainer>
          ) : isLoading ? (
            <LoadingContainer>
              <LoadingSpinner />
              <span>Generando vista previa...</span>
            </LoadingContainer>
          ) : (
            <PDFViewer style={{ width: '100%', height: '100%' }}>
              <LiquidacionPDF
                liquidacionData={pdfData}
                profesor={profesor}
              />
            </PDFViewer>
          )}
        </PDFContainer>

        <ModalActions>
          <ActionButton 
            variant="secondary" 
            onClick={onClose}
          >
            Cerrar
          </ActionButton>
          
          <BlobProvider
            document={
              <LiquidacionPDF
                liquidacionData={pdfData}
                profesor={profesor}
              />
            }
          >
            {({ blob, loading, error: blobError }) => (
              <ActionButton 
                variant="primary" 
                onClick={() => blob && handleDownload(blob)}
                disabled={loading || !blob || !!blobError}
              >
                {loading ? (
                  <>
                    <LoadingSpinner style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                    Preparando...
                  </>
                ) : 'Descargar PDF'}
              </ActionButton>
            )}
          </BlobProvider>
        </ModalActions>
      </ModalContent>
    </ModalOverlay>
  );
};