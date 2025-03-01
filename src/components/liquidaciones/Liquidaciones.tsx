// components/Liquidaciones/index.tsx
import React, { useState, useEffect } from 'react';
import { styled } from 'styled-components';
import { PreviewModal } from './PreviewModal';


interface Profesor {
  id: number;
  nombre: string;
  apellido: string;
  porcentajePorDefecto: number;
  porcentajeClasesSueltasPorDefecto: number;
}

interface Alumno {
  id: number;
  nombre: string;
  apellido: string;
}

interface Recibo {
  id: number;
  numeroRecibo: number;
  fecha: string;
  monto: number;
  tipoPago: string;
  alumno: Alumno | null;
  concepto: {
    nombre: string;
  };
  montoLiquidacion?: number;
  tipoLiquidacion?: string;
  porcentajeAplicado?: number;
}

interface LiquidacionData {
  regularCount: number;
  sueltasCount: number;
  totalRegular: number;
  totalSueltas: number;
  montoLiquidacionRegular: number;
  montoLiquidacionSueltas: number;
  recibos: Recibo[];
  periodo: string;
  claseSueltaDetalle?: {
    porConcepto: number;
    porFlag: number;
  };
}

interface FiltrosLiquidacion {
  profesorId?: number;
  alumnoId?: number;
  periodo: string;
}

interface PorcentajesPersonalizados {
  porcentajeCursos: number;
  porcentajeClasesSueltas: number;
}

// Styled Components
const Container = styled.div`
  background-color: #FFFFFF;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  max-width: 1000px;
  margin: 0 auto;
`;

const Title = styled.h2`
  color: #333;
  margin-bottom: 30px;
  text-align: center;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  width: 100%;
  background-color: #f9f9f9;
  transition: border-color 0.3s;

  &:focus {
    outline: none;
    border-color: #FFC001;
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  padding: 10px;
  margin-bottom: 20px;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  margin-bottom: 8px;
  font-weight: bold;
  color: #555;
`;

const Select = styled.select`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  background-color: #f9f9f9;
  transition: border-color 0.3s;

  &:focus {
    outline: none;
    border-color: #FFC001;
  }
`;

const MultiSelect = styled(Select)`
  height: 120px;
`;

const Button = styled.button`
  background-color: #FFC001;
  color: #000000;
  border: none;
  padding: 12px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.1s;
  font-size: 16px;
  font-weight: bold;
  grid-column: 1 / -1;
  width: 100%;

  &:hover {
    background-color: #e6ac00;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
`;


const Th = styled.th`
  background-color: #000000;
  color: #FFFFFF;
  text-align: left;
  padding: 12px;
`;

const Td = styled.td`
  border-bottom: 1px solid #F9F8F8;
  padding: 12px;
`;

const Tr = styled.tr`
  &:nth-child(even) {
    background-color: #F9F8F8;
  }
`;

const TotalContainer = styled.div`
  margin-top: 20px;
  text-align: right;
  font-size: 18px;
  font-weight: bold;
`;

const ExportButton = styled(Button)`
  margin-top: 20px;
`;

const ResumenContainer = styled.div`
  margin: 20px 0;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
`;

const ResumenGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin: 20px 0;
`;

const ResumenItem = styled.div`
  background-color: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);

  div {
    margin: 5px 0;
    font-size: 14px;
  }
`;

const TotalGeneral = styled.div`
  text-align: right;
  font-size: 18px;
  font-weight: bold;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid #ddd;
`;

const EditableInput = styled.input`
  border: 1px solid #ddd;
  padding: 4px 8px;
  border-radius: 4px;
  width: 120px;
  &:focus {
    border-color: #FFC001;
    outline: none;
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 10px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Nuevo styled component para la sección de porcentajes
const PorcentajesSection = styled.div`
  margin: 20px 0;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #dee2e6;
`;

const PorcentajesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 15px;
`;

const PorcentajeInput = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-weight: 500;
    color: #495057;
  }

  input {
    padding: 8px;
    border: 1px solid #ced4da;
    border-radius: 4px;
    width: 100px;
    
    &:focus {
      border-color: #FFC001;
      outline: none;
      box-shadow: 0 0 0 2px rgba(255, 192, 1, 0.2);
    }
  }
`;

const PreviewButton = styled(Button)`
  background-color: #28a745;
  margin-right: 10px;

  &:hover {
    background-color: #218838;
  }
`;

const DetalleContainer = styled.div`
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #ccc;
`;

const DetailsContainer = styled.div`
  margin-top: 20px;
`;

const DetailsTitle = styled.h4`
  margin-bottom: 10px;
  color: #495057;
`;

const DetailsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
`;

const DetailsTableHeader = styled.th`
  padding: 8px;
  text-align: left;
  background-color: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
`;

const DetailsTableCell = styled.td`
  padding: 8px;
  border-bottom: 1px solid #dee2e6;
`;

const DetailsTableRow = styled.tr`
  &:hover {
    background-color: #f8f9fa;
  }

  input {
    width: 80px;
    padding: 4px;
    border: 1px solid #ced4da;
    border-radius: 4px;
    text-align: right;
  }
`;

const Liquidaciones: React.FC = () => {
  // Estados para datos
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<FiltrosLiquidacion>({
    profesorId: undefined,
    alumnoId: undefined,
    periodo: new Date().toISOString().slice(0, 7)
  });

  // Estado para los valores editables del resumen
  const [valoresEditables, setValoresEditables] = useState({
    regularCount: 0,
    totalRegular: 0,
    sueltasCount: 0,
    totalSueltas: 0,
    claseSueltaConcepto: 0,
    claseSueltaFlag: 0
  });

  // Estado para los recibos editables individualmente
  const [recibosEditables, setRecibosEditables] = useState<any[]>([]);

  // Nuevos estados
  const [liquidacionData, setLiquidacionData] = useState<LiquidacionData | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [porcentajesPersonalizados, setPorcentajesPersonalizados] = useState<PorcentajesPersonalizados>({
    porcentajeCursos: 60,
    porcentajeClasesSueltas: 80
  });
  const [profesorSeleccionado, setProfesorSeleccionado] = useState<Profesor | null>(null);
  const [mostrarPorcentajes, setMostrarPorcentajes] = useState(false);
  const [mostrarDetalles, setMostrarDetalles] = useState(false);

  // Effects existentes
  useEffect(() => {
    fetchProfesores();
    fetchAlumnos();
  }, []);

  useEffect(() => {
    if (filtros.profesorId) {
      const profesor = profesores.find(p => p.id === Number(filtros.profesorId));
      if (profesor) {
        setProfesorSeleccionado(profesor);
        setPorcentajesPersonalizados({
          porcentajeCursos: profesor.porcentajePorDefecto * 100,
          porcentajeClasesSueltas: profesor.porcentajeClasesSueltasPorDefecto * 100
        });
      }
    } else {
      setProfesorSeleccionado(null);
      setPorcentajesPersonalizados({
        porcentajeCursos: 60,
        porcentajeClasesSueltas: 80
      });
    }
  }, [filtros.profesorId, profesores]);

  useEffect(() => {
    if (liquidacionData) {
      setValoresEditables({
        regularCount: liquidacionData.regularCount,
        totalRegular: liquidacionData.totalRegular,
        sueltasCount: liquidacionData.sueltasCount,
        totalSueltas: liquidacionData.totalSueltas,
        claseSueltaConcepto: liquidacionData.claseSueltaDetalle?.porConcepto || 0,
        claseSueltaFlag: liquidacionData.claseSueltaDetalle?.porFlag || 0
      });

      // Inicializar los recibos editables
      setRecibosEditables(liquidacionData.recibos.map(recibo => ({
        ...recibo,
        montoEditable: recibo.monto,
        porcentajeEditable: recibo.porcentajeAplicado || 
                           (recibo.tipoLiquidacion?.includes('Clase Suelta') 
                            ? porcentajesPersonalizados.porcentajeClasesSueltas / 100 
                            : porcentajesPersonalizados.porcentajeCursos / 100),
        montoLiquidacionEditable: recibo.montoLiquidacion || 0
      })));
    }
  }, [liquidacionData, porcentajesPersonalizados]);

  // Funciones existentes actualizadas
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

  const fetchAlumnos = async () => {
    try {
      const res = await fetch('/api/alumnos');
      if (!res.ok) throw new Error('Error al cargar alumnos');
      const data = await res.json();
      setAlumnos(data);
    } catch (error) {
      setError('Error al cargar los alumnos');
      console.error('Error fetching alumnos:', error);
    }
  };

  // Nuevas funciones de manejo
  const handlePorcentajeChange = (tipo: 'cursos' | 'sueltas', valor: string) => {
    const numeroValor = parseFloat(valor);
    if (isNaN(numeroValor) || numeroValor < 0 || numeroValor > 100) return;

    setPorcentajesPersonalizados(prev => ({
      ...prev,
      [tipo === 'cursos' ? 'porcentajeCursos' : 'porcentajeClasesSueltas']: numeroValor
    }));

    // Actualizar los montos de liquidación con el nuevo porcentaje
    if (recibosEditables.length > 0) {
      setRecibosEditables(prev => 
        prev.map(recibo => {
          if (
            (tipo === 'cursos' && !recibo.tipoLiquidacion?.includes('Clase Suelta')) ||
            (tipo === 'sueltas' && recibo.tipoLiquidacion?.includes('Clase Suelta'))
          ) {
            const nuevoPorcentaje = numeroValor / 100;
            return {
              ...recibo,
              porcentajeEditable: nuevoPorcentaje,
              montoLiquidacionEditable: recibo.montoEditable * nuevoPorcentaje
            };
          }
          return recibo;
        })
      );
    }
  };

  // Manejar cambios en los recibos individuales
  const handleReciboChange = (id: number, field: string, value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;

    setRecibosEditables(prev => 
      prev.map(recibo => {
        if (recibo.id === id) {
          const updatedRecibo = { ...recibo, [field]: numValue };
          
          // Si cambia el monto o el porcentaje, recalcular el monto de liquidación
          if (field === 'montoEditable' || field === 'porcentajeEditable') {
            updatedRecibo.montoLiquidacionEditable = 
              updatedRecibo.montoEditable * updatedRecibo.porcentajeEditable;
          }
          
          return updatedRecibo;
        }
        return recibo;
      })
    );

    // Recalcular los totales basados en los recibos editados
    recalcularTotales();
  };

  // Recalcular totales basados en recibos individuales
  const recalcularTotales = () => {
    const regularRecibos = recibosEditables.filter(r => 
      !r.tipoLiquidacion?.includes('Clase Suelta')
    );
    
    const claseSueltaPorConcepto = recibosEditables.filter(r => 
      r.tipoLiquidacion?.includes('Clase Suelta (por concepto)')
    );
    
    const claseSueltaPorFlag = recibosEditables.filter(r => 
      r.tipoLiquidacion?.includes('Clase Suelta (por flag)')
    );

    const totalRegular = regularRecibos.reduce((sum, r) => sum + r.montoEditable, 0);
    const totalSueltasConcepto = claseSueltaPorConcepto.reduce((sum, r) => sum + r.montoEditable, 0);
    const totalSueltasFlag = claseSueltaPorFlag.reduce((sum, r) => sum + r.montoEditable, 0);

    setValoresEditables(prev => ({
      ...prev,
      regularCount: regularRecibos.length,
      totalRegular: totalRegular,
      sueltasCount: claseSueltaPorConcepto.length + claseSueltaPorFlag.length,
      totalSueltas: totalSueltasConcepto + totalSueltasFlag,
      claseSueltaConcepto: totalSueltasConcepto,
      claseSueltaFlag: totalSueltasFlag
    }));
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
          porcentajes: {
            porcentajeCursos: porcentajesPersonalizados.porcentajeCursos / 100,
            porcentajeClasesSueltas: porcentajesPersonalizados.porcentajeClasesSueltas / 100
          },
          buscarConceptosClaseSuelta: true
        }),
      });

      if (!res.ok) {
        throw new Error('Error al generar la liquidación');
      }

      const data = await res.json();
      setLiquidacionData(data);
      setMostrarPorcentajes(true);
      setMostrarDetalles(false); // Resetear el estado de detalles
    } catch (error) {
      setError('Error al generar la liquidación');
      console.error('Error generando liquidación:', error);
    } finally {
      setLoading(false);
    }
  };

  // Preparar data para previsualización con valores editados
  const prepararDataParaPreview = () => {
    if (!liquidacionData) return null;

    // Calcular montos de liquidación actualizados
    const montoLiquidacionRegular = valoresEditables.totalRegular * (porcentajesPersonalizados.porcentajeCursos / 100);
    const montoLiquidacionSueltas = valoresEditables.totalSueltas * (porcentajesPersonalizados.porcentajeClasesSueltas / 100);

    // Usar los recibos editables
    return {
      ...liquidacionData,
      regularCount: valoresEditables.regularCount,
      totalRegular: valoresEditables.totalRegular,
      sueltasCount: valoresEditables.sueltasCount,
      totalSueltas: valoresEditables.totalSueltas,
      montoLiquidacionRegular: montoLiquidacionRegular,
      montoLiquidacionSueltas: montoLiquidacionSueltas,
      claseSueltaDetalle: {
        porConcepto: valoresEditables.claseSueltaConcepto,
        porFlag: valoresEditables.claseSueltaFlag
      },
      recibos: recibosEditables.map(recibo => ({
        ...recibo,
        monto: recibo.montoEditable,
        porcentajeAplicado: recibo.porcentajeEditable,
        montoLiquidacion: recibo.montoLiquidacionEditable
      }))
    };
  };

  // JSX
  return (
    <Container>
      <Title>Generación de Liquidaciones</Title>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}

      <Form onSubmit={(e) => { e.preventDefault(); calcularLiquidacion(); }}>
        <FormGroup>
          <Label htmlFor="periodo">Período</Label>
          <Input
            type="month"
            id="periodo"
            required
            value={filtros.periodo}
            onChange={(e) => setFiltros(prev => ({
              ...prev,
              periodo: e.target.value
            }))}
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="profesor">Profesor</Label>
          <Select 
            id="profesor" 
            value={filtros.profesorId || ''}
            onChange={(e) => setFiltros(prev => ({
              ...prev,
              profesorId: e.target.value ? Number(e.target.value) : undefined
            }))}
          >
            <option value="">Seleccionar profesor</option>
            {profesores.map(profesor => (
              <option key={profesor.id} value={profesor.id}>
                {`${profesor.apellido}, ${profesor.nombre}`}
              </option>
            ))}
          </Select>
        </FormGroup>

        {profesorSeleccionado && (
          <PorcentajesSection>
            <h3>Porcentajes de Liquidación</h3>
            <p>Puede modificar los porcentajes por defecto para esta liquidación</p>
            
            <PorcentajesGrid>
              <PorcentajeInput>
                <label>Cursos Regulares (%)</label>
                <input
                  type="number"
                  value={porcentajesPersonalizados.porcentajeCursos}
                  onChange={(e) => handlePorcentajeChange('cursos', e.target.value)}
                  min="0"
                  max="100"
                  step="1"
                />
                <small>Por defecto: {profesorSeleccionado.porcentajePorDefecto * 100}%</small>
              </PorcentajeInput>

              <PorcentajeInput>
                <label>Clases Sueltas (%)</label>
                <input
                  type="number"
                  value={porcentajesPersonalizados.porcentajeClasesSueltas}
                  onChange={(e) => handlePorcentajeChange('sueltas', e.target.value)}
                  min="0"
                  max="100"
                  step="1"
                />
                <small>Por defecto: {profesorSeleccionado.porcentajeClasesSueltasPorDefecto * 100}%</small>
              </PorcentajeInput>
            </PorcentajesGrid>
          </PorcentajesSection>
        )}

        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <LoadingSpinner />
              Calculando...
            </>
          ) : 'Calcular Liquidación'}
        </Button>
      </Form>

      {liquidacionData && mostrarPorcentajes && (
        <>
          <ResumenContainer>
            <h3>Resumen de Liquidación</h3>
            <ResumenGrid>
              <ResumenItem>
                <h4>Cursos Regulares</h4>
                <div>
                  <label>Cantidad de alumnos: </label>
                  <EditableInput
                    type="number"
                    value={valoresEditables.regularCount}
                    onChange={(e) => setValoresEditables(prev => ({
                      ...prev,
                      regularCount: parseInt(e.target.value) || 0
                    }))}
                  />
                </div>
                <div>
                  <label>Total recaudado: $</label>
                  <EditableInput
                    type="number"
                    step="0.01"
                    value={valoresEditables.totalRegular}
                    onChange={(e) => setValoresEditables(prev => ({
                      ...prev,
                      totalRegular: parseFloat(e.target.value) || 0
                    }))}
                  />
                </div>
                <div>Porcentaje profesor: {porcentajesPersonalizados.porcentajeCursos}%</div>
                <div>Monto liquidación: ${(valoresEditables.totalRegular * porcentajesPersonalizados.porcentajeCursos / 100).toFixed(2)}</div>
              </ResumenItem>

              <ResumenItem>
                <h4>Clases Sueltas</h4>
                <div>
                  <label>Cantidad de alumnos: </label>
                  <EditableInput
                    type="number"
                    value={valoresEditables.sueltasCount}
                    onChange={(e) => setValoresEditables(prev => ({
                      ...prev,
                      sueltasCount: parseInt(e.target.value) || 0
                    }))}
                  />
                </div>
                <div>
                  <label>Total recaudado: $</label>
                  <EditableInput
                    type="number"
                    step="0.01"
                    value={valoresEditables.totalSueltas}
                    onChange={(e) => setValoresEditables(prev => ({
                      ...prev,
                      totalSueltas: parseFloat(e.target.value) || 0
                    }))}
                  />
                </div>
                <div>Porcentaje profesor: {porcentajesPersonalizados.porcentajeClasesSueltas}%</div>
                <div>Monto liquidación: ${(valoresEditables.totalSueltas * porcentajesPersonalizados.porcentajeClasesSueltas / 100).toFixed(2)}</div>
                
                {/* Detalle de clases sueltas */}
                <DetalleContainer>
                  <div><strong>Desglose de Clases Sueltas:</strong></div>
                  <div>
                    <label>Por concepto: $</label>
                    <EditableInput
                      type="number"
                      step="0.01"
                      value={valoresEditables.claseSueltaConcepto}
                      onChange={(e) => {
                        const newValue = parseFloat(e.target.value) || 0;
                        setValoresEditables(prev => ({
                          ...prev,
                          claseSueltaConcepto: newValue,
                          totalSueltas: newValue + prev.claseSueltaFlag
                        }));
                      }}
                    />
                  </div>
                  <div>
                    <label>Por flag: $</label>
                    <EditableInput
                      type="number"
                      step="0.01"
                      value={valoresEditables.claseSueltaFlag}
                      onChange={(e) => {
                        const newValue = parseFloat(e.target.value) || 0;
                        setValoresEditables(prev => ({
                          ...prev,
                          claseSueltaFlag: newValue,
                          totalSueltas: prev.claseSueltaConcepto + newValue
                        }));
                      }}
                    />
                  </div>
                </DetalleContainer>
              </ResumenItem>
            </ResumenGrid>

            <TotalGeneral>
              Total a Liquidar: ${(
                (valoresEditables.totalRegular * porcentajesPersonalizados.porcentajeCursos / 100) + 
                (valoresEditables.totalSueltas * porcentajesPersonalizados.porcentajeClasesSueltas / 100)
              ).toFixed(2)}
            </TotalGeneral>

            <ButtonContainer>
              <Button onClick={() => setMostrarDetalles(!mostrarDetalles)}>
                {mostrarDetalles ? "Ocultar Detalles" : "Mostrar Detalles"}
              </Button>
              <PreviewButton onClick={() => setShowPreview(true)}>
                Vista Previa
              </PreviewButton>
            </ButtonContainer>
          </ResumenContainer>

          {/* Sección de Detalles */}
          {mostrarDetalles && (
            <DetailsContainer>
              <DetailsTitle>Detalle de Recibos</DetailsTitle>
              <DetailsTable>
                <thead>
                  <tr>
                    <DetailsTableHeader>N° Recibo</DetailsTableHeader>
                    <DetailsTableHeader>Fecha</DetailsTableHeader>
                    <DetailsTableHeader>Alumno</DetailsTableHeader>
                    <DetailsTableHeader>Concepto</DetailsTableHeader>
                    <DetailsTableHeader>Tipo</DetailsTableHeader>
                    <DetailsTableHeader>Monto</DetailsTableHeader>
                    <DetailsTableHeader>%</DetailsTableHeader>
                    <DetailsTableHeader>A Liquidar</DetailsTableHeader>
                  </tr>
                </thead>
                <tbody>
                  {recibosEditables.map((recibo) => (
                    <DetailsTableRow key={recibo.id}>
                      <DetailsTableCell>{recibo.numeroRecibo}</DetailsTableCell>
                      <DetailsTableCell>{new Date(recibo.fecha).toLocaleDateString()}</DetailsTableCell>
                      <DetailsTableCell>
                        {recibo.alumno ? 
                          `${recibo.alumno.apellido}, ${recibo.alumno.nombre}` : 
                          recibo.alumnoSuelto ? 
                            `${recibo.alumnoSuelto.apellido}, ${recibo.alumnoSuelto.nombre}` : 
                            'Sin alumno'}
                      </DetailsTableCell>
                      <DetailsTableCell>{
                        recibo.concepto.nombre}</DetailsTableCell>
                        <DetailsTableCell>{recibo.tipoLiquidacion || 'Regular'}</DetailsTableCell>
                        <DetailsTableCell>
                          <input
                            type="number"
                            step="0.01"
                            value={recibo.montoEditable}
                            onChange={(e) => handleReciboChange(recibo.id, 'montoEditable', e.target.value)}
                          />
                        </DetailsTableCell>
                        <DetailsTableCell>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="1"
                            value={recibo.porcentajeEditable}
                            onChange={(e) => handleReciboChange(recibo.id, 'porcentajeEditable', e.target.value)}
                          />
                        </DetailsTableCell>
                        <DetailsTableCell>
                          <input
                            type="number"
                            step="0.01"
                            value={recibo.montoLiquidacionEditable}
                            onChange={(e) => handleReciboChange(recibo.id, 'montoLiquidacionEditable', e.target.value)}
                          />
                        </DetailsTableCell>
                      </DetailsTableRow>
                    ))}
                  </tbody>
                </DetailsTable>
              </DetailsContainer>
            )}
          </>
        )}
  
        {showPreview && liquidacionData && (
          <PreviewModal
            liquidacionData={prepararDataParaPreview() || liquidacionData}
            profesor={profesorSeleccionado}
            porcentajesPersonalizados={porcentajesPersonalizados}
            onClose={() => setShowPreview(false)}
          />
        )}
      </Container>
    );
  };
  
  export default Liquidaciones;