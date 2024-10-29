import { AlumnoEstilo, Descuento } from '@/types/alumnos-estilos';
import React, { useState, useEffect } from 'react';
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
  padding: 8px;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
`;

const EstiloInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const EstiloNombre = styled.span`
  font-weight: 500;
`;

const EstiloMonto = styled.span`
  font-size: 0.9em;
  color: #666;
`;

const EstiloFecha = styled.span`
  font-size: 0.8em;
  color: #888;
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2em;
  padding: 5px;
  color: #666;
  
  &:hover {
    color: #000;
  }
`;

const EstilosList = styled.div`
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease-out;
  background-color: #f9f9f9;
  border-radius: 4px;

  &.open {
    max-height: 500px;
    padding: 10px;
    margin-top: 5px;
    border: 1px solid #eee;
  }
`;

const DescuentoInfo = styled.div`
  margin-top: 10px;
  padding: 8px;
  background-color: #fff;
  border-radius: 4px;
  border: 1px dashed #FFC001;
`;

const ResumenEstilos = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
`;

interface EstilosProps {
  alumnoEstilos: AlumnoEstilo[];
  onEstiloToggle: (alumnoId: number, estiloId: number, activo: boolean) => void;
  alumnoId: number;
  descuentosVigentes?: {
    descuento: Descuento;
    fechaInicio: Date;
  }[];
}

const EstilosComponent: React.FC<EstilosProps> = ({ 
  alumnoEstilos, 
  onEstiloToggle, 
  alumnoId,
  descuentosVigentes 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [totalMensual, setTotalMensual] = useState(0);
  const estilosActivos = alumnoEstilos.filter(ae => ae.activo);

  useEffect(() => {
    const total = estilosActivos.reduce((sum, ae) => sum + ae.estilo.monto, 0);
    setTotalMensual(total);
  }, [estilosActivos]);

  const formatFecha = (fecha: Date) => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calcularMontoConDescuentos = (monto: number) => {
    if (!descuentosVigentes?.length) return monto;
    
    return descuentosVigentes.reduce((montoActual, { descuento }) => {
      return montoActual * (1 - descuento.porcentaje / 100);
    }, monto);
  };

  return (
    <EstilosContainer>
      <ResumenEstilos>
        <span>{estilosActivos.length} estilo{estilosActivos.length !== 1 ? 's' : ''} activo{estilosActivos.length !== 1 ? 's' : ''}</span>
        <ToggleButton onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? '▲' : '▼'}
        </ToggleButton>
      </ResumenEstilos>

      <EstilosList className={isOpen ? 'open' : ''}>
        {alumnoEstilos.map(ae => (
          <EstiloItem key={ae.estilo.id}>
            <EstiloInfo>
              <EstiloNombre>{ae.estilo.nombre}</EstiloNombre>
              <EstiloMonto>${ae.estilo.importe?.toFixed(2) || '0.00'}/mes</EstiloMonto>
              {ae.fechaInicio && (
                <EstiloFecha>
                  Desde: {formatFecha(ae.fechaInicio)}
                  {ae.fechaFin && ` - Hasta: ${formatFecha(ae.fechaFin)}`}
                </EstiloFecha>
              )}
            </EstiloInfo>
            <Button 
              onClick={() => onEstiloToggle(alumnoId, ae.estilo.id, !ae.activo)}
              style={{ 
                backgroundColor: ae.activo ? '#FFC001' : '#f0f0f0',
                color: ae.activo ? '#000' : '#666'
              }}
            >
              {ae.activo ? 'Dar de Baja' : 'Reactivar'}
            </Button>
          </EstiloItem>
        ))}

        {totalMensual > 0 && (
          <DescuentoInfo>
            <div>Total mensual: ${totalMensual.toFixed(2)}</div>
            {descuentosVigentes?.map(({ descuento, fechaInicio }) => (
              <div key={descuento.id} style={{ fontSize: '0.9em', color: '#666' }}>
                {descuento.esAutomatico ? 'Descuento automático' : 'Descuento manual'}: 
                {descuento.porcentaje}% 
                (desde {formatFecha(fechaInicio)})
              </div>
            ))}
            <div style={{ marginTop: '5px', fontWeight: 'bold' }}>
              Total con descuentos: ${calcularMontoConDescuentos(totalMensual).toFixed(2)}
            </div>
          </DescuentoInfo>
        )}
      </EstilosList>
    </EstilosContainer>
  );
};

export default EstilosComponent;