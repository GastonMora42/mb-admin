import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { PreviewModal } from './PreviewModal';

// Interfaces
interface Profesor {
  id: number;
  nombre: string;
  apellido: string;
  porcentajePorDefecto: number;
  porcentajeClasesSueltasPorDefecto: number;
  montoFijoRegular?: number;
  montoFijoSueltas?: number;
  tipoLiquidacionRegular: 'PORCENTAJE' | 'MONTO_FIJO';
  tipoLiquidacionSueltas: 'PORCENTAJE' | 'MONTO_FIJO';
}

interface LiquidacionData {
  regularCount: number;
  sueltasCount: number;
  clasesCount: number;
  totalRegular: number;
  totalSueltas: number;
  montoLiquidacionRegular: number;
  montoLiquidacionSueltas: number;
  recibos: any[];
  periodo: string;
}

interface ConfiguracionLiquidacion {
  tipoRegular: 'PORCENTAJE' | 'MONTO_FIJO';
  tipoSueltas: 'PORCENTAJE' | 'MONTO_FIJO';
  porcentajeRegular: number;
  porcentajeSueltas: number;
  montoFijoRegular: number;
  montoFijoSueltas: number;
}

// Styled Components
const Container = styled.div`
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
  padding: 1rem;
  
  @media (min-width: 768px) {
    padding: 2rem;
  }
`;

const Card = styled(motion.div)`
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  margin-bottom: 2rem;
  
  @media (min-width: 768px) {
    padding: 2rem;
  }
`;

const Title = styled.h2`
  color: #1e293b;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 2rem;
  text-align: center;
  
  @media (min-width: 768px) {
    font-size: 2rem;
    text-align: left;
  }
`;

const Form = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #FFC001;
    box-shadow: 0 0 0 3px rgba(255, 192, 1, 0.1);
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  background: white;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #FFC001;
    box-shadow: 0 0 0 3px rgba(255, 192, 1, 0.1);
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  
  ${props => props.variant === 'secondary' ? `
    background: #f8fafc;
    color: #475569;
    border: 1px solid #e2e8f0;
    
    &:hover {
      background: #f1f5f9;
    }
  ` : `
    background: #FFC001;
    color: #1a202c;
    
    &:hover {
      background: #e6ac00;
      transform: translateY(-1px);
    }
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ConfiguracionSection = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin: 1.5rem 0;
`;

const ConfiguracionTitle = styled.h3`
  color: #1e293b;
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 1rem;
`;

const ConfiguracionGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const ConfiguracionItem = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 1.25rem;
`;

const ConfiguracionItemTitle = styled.h4`
  color: #374151;
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1rem;
`;

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const RadioOption = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  
  input[type="radio"] {
    margin: 0;
  }
`;

const ResumenContainer = styled.div`
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin: 1.5rem 0;
`;

const ResumenGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const ResumenItem = styled.div`
  background: white;
  border-radius: 0.5rem;
  padding: 1.25rem;
  border: 1px solid #dcfce7;
`;

const ResumenItemTitle = styled.h4`
  color: #166534;
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.75rem;
`;

const ResumenRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  
  &:last-child {
    margin-bottom: 0;
    font-weight: 600;
    font-size: 1rem;
    color: #166534;
    padding-top: 0.5rem;
    border-top: 1px solid #dcfce7;
  }
`;

const ErrorMessage = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #FFC001;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 10px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  
  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: flex-end;
  }
`;

const Liquidaciones: React.FC = () => {
  // Estados
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profesorSeleccionado, setProfesorSeleccionado] = useState<Profesor | null>(null);
  const [liquidacionData, setLiquidacionData] = useState<LiquidacionData | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const [filtros, setFiltros] = useState({
    profesorId: '',
    periodo: new Date().toISOString().slice(0, 7)
  });

  const [configuracion, setConfiguracion] = useState<ConfiguracionLiquidacion>({
    tipoRegular: 'PORCENTAJE' as const,
    tipoSueltas: 'PORCENTAJE' as const,
    porcentajeRegular: 60,
    porcentajeSueltas: 80,
    montoFijoRegular: 0,
    montoFijoSueltas: 0
  });

  useEffect(() => {
    fetchProfesores();
  }, []);

  useEffect(() => {
    if (filtros.profesorId) {
      const profesor = profesores.find(p => p.id === Number(filtros.profesorId));
      if (profesor) {
        setProfesorSeleccionado(profesor);
        setConfiguracion({
          tipoRegular: profesor.tipoLiquidacionRegular || 'PORCENTAJE',
          tipoSueltas: profesor.tipoLiquidacionSueltas || 'PORCENTAJE',
          porcentajeRegular: profesor.porcentajePorDefecto * 100,
          porcentajeSueltas: profesor.porcentajeClasesSueltasPorDefecto * 100,
          montoFijoRegular: profesor.montoFijoRegular || 0,
          montoFijoSueltas: profesor.montoFijoSueltas || 0
        });
      }
    } else {
      setProfesorSeleccionado(null);
    }
  }, [filtros.profesorId, profesores]);

  const fetchProfesores = async () => {
    try {
      const res = await fetch('/api/profesores');
      if (!res.ok) throw new Error('Error al cargar profesores');
      const data = await res.json();
      setProfesores(data);
    } catch (error) {
      setError('Error al cargar los profesores');
      console.error('Error fetching profesores:', error);
    }
  };

  const calcularLiquidacion = async () => {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/liquidaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...filtros,
          configuracion
        }),
      });

      if (!res.ok) {
        throw new Error('Error al generar la liquidación');
      }

      const data = await res.json();
      setLiquidacionData(data);
    } catch (error) {
      setError('Error al generar la liquidación');
      console.error('Error generando liquidación:', error);
    } finally {
      setLoading(false);
    }
  };

  const actualizarConfiguracionProfesor = async () => {
    if (!profesorSeleccionado) return;

    try {
      const res = await fetch(`/api/profesores/${profesorSeleccionado.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipoLiquidacionRegular: configuracion.tipoRegular,
          tipoLiquidacionSueltas: configuracion.tipoSueltas,
          montoFijoRegular: configuracion.montoFijoRegular,
          montoFijoSueltas: configuracion.montoFijoSueltas,
          porcentajePorDefecto: configuracion.porcentajeRegular / 100,
          porcentajeClasesSueltasPorDefecto: configuracion.porcentajeSueltas / 100
        }),
      });

      if (!res.ok) throw new Error('Error al actualizar configuración');
      
      // Actualizar profesor en el estado
      setProfesores(prev => prev.map(p => 
        p.id === profesorSeleccionado.id 
          ? { ...p, ...configuracion }
          : p
      ));
      
      alert('Configuración actualizada correctamente');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar la configuración');
    }
  };

  const calcularMontoLiquidacion = (total: number, tipo: 'regular' | 'sueltas') => {
    if (tipo === 'regular') {
      return configuracion.tipoRegular === 'MONTO_FIJO' 
        ? configuracion.montoFijoRegular
        : total * (configuracion.porcentajeRegular / 100);
    } else {
      return configuracion.tipoSueltas === 'MONTO_FIJO' 
        ? configuracion.montoFijoSueltas
        : total * (configuracion.porcentajeSueltas / 100);
    }
  };

  return (
    <Container>
      <Card
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Title>Generación de Liquidaciones</Title>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}

        <Form>
          <FormGroup>
            <Label>Período</Label>
            <Input
              type="month"
              required
              value={filtros.periodo}
              onChange={(e) => setFiltros(prev => ({
                ...prev,
                periodo: e.target.value
              }))}
            />
          </FormGroup>

          <FormGroup>
            <Label>Profesor</Label>
            <Select 
              value={filtros.profesorId}
              onChange={(e) => setFiltros(prev => ({
                ...prev,
                profesorId: e.target.value
              }))}
              required
            >
              <option value="">Seleccionar profesor</option>
              {profesores.map(profesor => (
                <option key={profesor.id} value={profesor.id}>
                  {`${profesor.apellido}, ${profesor.nombre}`}
                </option>
              ))}
            </Select>
          </FormGroup>
        </Form>

        {profesorSeleccionado && (
          <ConfiguracionSection>
            <ConfiguracionTitle>Configuración de Liquidación</ConfiguracionTitle>
            
            <ConfiguracionGrid>
              <ConfiguracionItem>
                <ConfiguracionItemTitle>Clases Regulares</ConfiguracionItemTitle>
                
                <RadioGroup>
                  <RadioOption>
                    <input
                      type="radio"
                      name="tipoRegular"
                      checked={configuracion.tipoRegular === 'PORCENTAJE'}
                      onChange={() => setConfiguracion(prev => ({ ...prev, tipoRegular: 'PORCENTAJE' }))}
                    />
                    <span>Porcentaje</span>
                  </RadioOption>
                  <RadioOption>
                    <input
                      type="radio"
                      name="tipoRegular"
                      checked={configuracion.tipoRegular === 'MONTO_FIJO'}
                      onChange={() => setConfiguracion(prev => ({ ...prev, tipoRegular: 'MONTO_FIJO' }))}
                    />
                    <span>Monto Fijo</span>
                  </RadioOption>
                </RadioGroup>

                {configuracion.tipoRegular === 'PORCENTAJE' ? (
                  <FormGroup>
                    <Label>Porcentaje (%)</Label>
                    <Input
                      type="number"
                      value={configuracion.porcentajeRegular}
                      onChange={(e) => setConfiguracion(prev => ({ 
                        ...prev, 
                        porcentajeRegular: Number(e.target.value) 
                      }))}
                      min="0"
                      max="100"
                      step="1"
                    />
                  </FormGroup>
                ) : (
                  <FormGroup>
                    <Label>Monto Fijo ($)</Label>
                    <Input
                      type="number"
                      value={configuracion.montoFijoRegular}
                      onChange={(e) => setConfiguracion(prev => ({ 
                        ...prev, 
                        montoFijoRegular: Number(e.target.value) 
                      }))}
                      min="0"
                      step="100"
                    />
                  </FormGroup>
                )}
              </ConfiguracionItem>

              <ConfiguracionItem>
                <ConfiguracionItemTitle>Clases Sueltas</ConfiguracionItemTitle>
                
                <RadioGroup>
                  <RadioOption>
                    <input
                      type="radio"
                      name="tipoSueltas"
                      checked={configuracion.tipoSueltas === 'PORCENTAJE'}
                      onChange={() => setConfiguracion(prev => ({ ...prev, tipoSueltas: 'PORCENTAJE' }))}
                    />
                    <span>Porcentaje</span>
                  </RadioOption>
                  <RadioOption>
                    <input
                      type="radio"
                      name="tipoSueltas"
                      checked={configuracion.tipoSueltas === 'MONTO_FIJO'}
                      onChange={() => setConfiguracion(prev => ({ ...prev, tipoSueltas: 'MONTO_FIJO' }))}
                    />
                    <span>Monto Fijo</span>
                  </RadioOption>
                </RadioGroup>

                {configuracion.tipoSueltas === 'PORCENTAJE' ? (
                  <FormGroup>
                    <Label>Porcentaje (%)</Label>
                    <Input
                      type="number"
                      value={configuracion.porcentajeSueltas}
                      onChange={(e) => setConfiguracion(prev => ({ 
                        ...prev, 
                        porcentajeSueltas: Number(e.target.value) 
                      }))}
                      min="0"
                      max="100"
                      step="1"
                    />
                  </FormGroup>
                ) : (
                  <FormGroup>
                    <Label>Monto Fijo ($)</Label>
                    <Input
                      type="number"
                      value={configuracion.montoFijoSueltas}
                      onChange={(e) => setConfiguracion(prev => ({ 
                        ...prev, 
                        montoFijoSueltas: Number(e.target.value) 
                      }))}
                      min="0"
                      step="100"
                    />
                  </FormGroup>
                )}
              </ConfiguracionItem>
            </ConfiguracionGrid>

            <ButtonContainer>
              <Button 
                type="button" 
                variant="secondary"
                onClick={actualizarConfiguracionProfesor}
              >
                Guardar Configuración
              </Button>
              <Button disabled={loading} onClick={calcularLiquidacion}>
                {loading ? (
                  <>
                    <LoadingSpinner />
                    Calculando...
                  </>
                ) : 'Calcular Liquidación'}
              </Button>
            </ButtonContainer>
          </ConfiguracionSection>
        )}

        {liquidacionData && (
          <ResumenContainer>
            <ConfiguracionTitle>Resumen de Liquidación</ConfiguracionTitle>
            
            <ResumenGrid>
              <ResumenItem>
                <ResumenItemTitle>Clases Regulares</ResumenItemTitle>
                <ResumenRow>
                  <span>Cantidad de recibos:</span>
                  <span>{liquidacionData.regularCount}</span>
                </ResumenRow>
                <ResumenRow>
                  <span>Total recaudado:</span>
                  <span>${liquidacionData.totalRegular.toFixed(2)}</span>
                </ResumenRow>
                <ResumenRow>
                  <span>Tipo de liquidación:</span>
                  <span>{configuracion.tipoRegular === 'MONTO_FIJO' ? 'Monto Fijo' : `${configuracion.porcentajeRegular}%`}</span>
                </ResumenRow>
                <ResumenRow>
                  <span>Monto a liquidar:</span>
                  <span>${calcularMontoLiquidacion(liquidacionData.totalRegular, 'regular').toFixed(2)}</span>
                </ResumenRow>
              </ResumenItem>

              <ResumenItem>
                <ResumenItemTitle>Clases Sueltas</ResumenItemTitle>
                <ResumenRow>
                  <span>Cantidad de alumnos:</span>
                  <span>{liquidacionData.sueltasCount}</span>
                </ResumenRow>
                <ResumenRow>
                  <span>Cantidad de clases:</span>
                  <span>{liquidacionData.clasesCount}</span>
                </ResumenRow>
                <ResumenRow>
                  <span>Total recaudado:</span>
                  <span>${liquidacionData.totalSueltas.toFixed(2)}</span>
                </ResumenRow>
                <ResumenRow>
                  <span>Tipo de liquidación:</span>
                  <span>{configuracion.tipoSueltas === 'MONTO_FIJO' ? 'Monto Fijo' : `${configuracion.porcentajeSueltas}%`}</span>
                </ResumenRow>
                <ResumenRow>
                  <span>Monto a liquidar:</span>
                  <span>${calcularMontoLiquidacion(liquidacionData.totalSueltas, 'sueltas').toFixed(2)}</span>
                </ResumenRow>
              </ResumenItem>
            </ResumenGrid>

            <ResumenRow style={{ marginTop: '1.5rem', fontSize: '1.25rem', fontWeight: 'bold' }}>
              <span>Total a Liquidar:</span>
              <span>${(
                calcularMontoLiquidacion(liquidacionData.totalRegular, 'regular') +
                calcularMontoLiquidacion(liquidacionData.totalSueltas, 'sueltas')
              ).toFixed(2)}</span>
            </ResumenRow>

            <ButtonContainer>
              <Button onClick={() => setShowPreview(true)}>
                Vista Previa y Descargar PDF
              </Button>
            </ButtonContainer>
          </ResumenContainer>
        )}
      </Card>

      {showPreview && liquidacionData && profesorSeleccionado && (
        <PreviewModal
          liquidacionData={{
            ...liquidacionData,
            montoLiquidacionRegular: calcularMontoLiquidacion(liquidacionData.totalRegular, 'regular'),
            montoLiquidacionSueltas: calcularMontoLiquidacion(liquidacionData.totalSueltas, 'sueltas')
          }}
          profesor={profesorSeleccionado}
          configuracion={configuracion}
          onClose={() => setShowPreview(false)}
        />
      )}
    </Container>
  );
};

export default Liquidaciones;