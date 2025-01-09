import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';
import { 
  Alumno, 
  AlumnoSuelto, 
  Concepto, 
  Recibo, 
  TipoPago, 
  Deuda,
  PagoDeuda 
} from '@/types/alumnos-estilos';

// Styled Components
const Container = styled.div`
  background-color: #FFFFFF;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: relative;
`;

const MainContent = styled.div<{ isFilterOpen: boolean }>`
  margin-right: ${props => props.isFilterOpen ? '400px' : '0'};
  transition: margin-right 0.3s ease;
`;

const FilterToggleButton = styled.button<{ isOpen?: boolean }>`
  position: fixed;
  right: ${props => props.isOpen ? '400px' : '0'};
  top: 100px; // Cambiamos de 50% a una posición más arriba
  background-color: #FFC001;
  color: #000000;
  border: none;
  padding: 8px 12px; // Reducimos el padding
  font-size: 0.9em; // Reducimos el tamaño de fuente
  border-radius: 4px 0 0 4px;
  cursor: pointer;
  transition: right 0.3s ease;
  z-index: 1001;
  box-shadow: -2px 0 5px rgba(0,0,0,0.1);

  &:hover {
    background-color: #e6ac00;
  }
`;

const NoDeudas = styled.div`
  text-align: center;
  padding: 1rem;
  color: #666;
  font-style: italic;
`;

// Agreguemos estilos para los grupos de inputs
const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
  min-width: 200px;
`;

const InputLabel = styled.label`
  font-weight: 500;
  color: #333;
  font-size: 0.9em;
`;

// Para la vista previa de recibos pendientes
const PreviewRecibos = styled.div`
  margin: 20px 0;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #eee;
`;

const PreviewReciboItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
`;

const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  white-space: nowrap;
`;

const Title = styled.h2`
  color: #000000;
  margin-bottom: 20px;
`;

const Form = styled.form`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 30px;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  flex: 1;
  min-width: 200px;
`;

const Select = styled.select`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  flex: 1;
  min-width: 200px;
`;

const Button = styled.button`
  background-color: #FFC001;
  color: #000000;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  white-space: nowrap;

  &:hover {
    background-color: #e6ac00;
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
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
  white-space: nowrap;
`;

const Td = styled.td`
  border-bottom: 1px solid #F9F8F8;
  padding: 12px;
  white-space: nowrap;
`;

const Tr = styled.tr`
  &:nth-child(even) {
    background-color: #F9F8F8;
  }
`;

const Message = styled.div<{ isError?: boolean }>`
  margin-top: 20px;
  padding: 10px;
  border-radius: 4px;
  background-color: ${props => props.isError ? '#ffcccc' : '#ccffcc'};
  color: ${props => props.isError ? '#cc0000' : '#006600'};
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
`;

const FiltersPanel = styled.div<{ isOpen: boolean }>`
  position: fixed;
  right: ${props => props.isOpen ? '0' : '-400px'};
  top: 0;
  width: 400px;
  height: 100vh;
  background-color: white;
  box-shadow: -2px 0 5px rgba(0,0,0,0.1);
  transition: right 0.3s ease;
  padding: 30px;
  z-index: 1000;
  overflow-y: auto;

  /* Estilo para el scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;

const FilterSection = styled.div`
  margin-bottom: 25px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #eee;
  transition: all 0.3s ease;

  &:hover {
    border-color: #FFC001;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }
`;

const FilterTitle = styled.h3`
  color: #000000;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #FFC001;
  font-size: 1.2em;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const FiltersForm = styled(Form)`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FilterInputLabel = styled(InputLabel)`
  margin-bottom: 8px;
  color: #666;
  font-size: 0.9em;
  font-weight: 600;
`;

const FilterInput = styled(Input)`
  background-color: white;
  border: 1px solid #ddd;
  transition: all 0.3s ease;

  &:focus {
    border-color: #FFC001;
    box-shadow: 0 0 0 2px rgba(255, 192, 1, 0.2);
  }
`;

const CloseFiltersButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #000000;
  
  &:hover {
    color: #666;
  }
`;

const PreviewSection = styled.div`
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 20px;
`;

const PreviewTitle = styled.h3`
  color: #000000;
  margin-bottom: 15px;
`;

const PreviewDetail = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  padding-bottom: 5px;
  border-bottom: 1px solid #eee;
`;

const PreviewTotal = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 2px solid #FFC001;
  font-weight: bold;
`;

const DeudaItem = styled.div`
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 4px;
  margin-bottom: 10px;
`;

const DeudaSection = styled.div`
  margin: 15px 0;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 4px;
`;


interface VistaPrevia {
  subtotal: number;
  descuentos: number;
  total: number;
  deudasAPagar: {
    id: number;
    concepto: string;
    monto: number;
  }[];
}

interface Filtros {
  numero: string;
  alumnoId: string;
  alumnoSueltoId: string;
  conceptoId: string;
  periodo: string;
  fueraDeTermino: string;
  esClaseSuelta: string;
  fechaDesde: string;
  fechaHasta: string;
  anulado: string;
  tipoPago: string; // Agregamos tipoPago
}


interface DeudaSeleccionada {
  estiloId: any;
  periodo: any;
  deudaId: number;
  monto: number;
  montoOriginal: number;
}

interface ReciboPendiente {
  id: string;
  alumno?: Alumno;
  alumnoSuelto?: AlumnoSuelto;
  monto: number;
  fecha: string;
  fechaEfecto: string;
  periodoPago: string;
  concepto: Concepto;
  tipoPago: TipoPago;
  descuento?: number; // Cambiamos number | null a number | undefined
  deudasSeleccionadas?: {[key: number]: DeudaSeleccionada};
}

const initialFiltros: Filtros = {
  numero: '',
  alumnoId: '',
  alumnoSueltoId: '',
  conceptoId: '',
  periodo: '',
  fueraDeTermino: '',
  esClaseSuelta: '',
  fechaDesde: '',
  fechaHasta: '',
  anulado: '',
  tipoPago: ''
};

const initialVistaPrevia: VistaPrevia = {
  subtotal: 0,
  descuentos: 0,
  total: 0,
  deudasAPagar: []
};

const Recibos: React.FC = () => {
  const [recibos, setRecibos] = useState<Recibo[]>([]);
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [alumnosSueltos, setAlumnosSueltos] = useState<AlumnoSuelto[]>([]);
  const [conceptos, setConceptos] = useState<Concepto[]>([]);
  const [deudasAlumno, setDeudasAlumno] = useState<Deuda[]>([]);
  const [deudasSeleccionadas, setDeudasSeleccionadas] = useState<{[key: number]: DeudaSeleccionada}>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [conceptosFiltrados, setConceptosFiltrados] = useState<Concepto[]>([]); // Nuevo estado
  const [vistaPrevia, setVistaPrevia] = useState<VistaPrevia>(initialVistaPrevia);
  const [estiloSeleccionado, setEstiloSeleccionado] = useState<string>('');
  
  const [nuevoRecibo, setNuevoRecibo] = useState({
    monto: '',
    periodoPago: format(new Date(), 'yyyy-MM'),
    tipoPago: TipoPago.EFECTIVO, // Cambiado de 'EFECTIVO' a TipoPago.EFECTIVO
    alumnoId: '',
    alumnoSueltoId: '',
    conceptoId: '',
    fueraDeTermino: false,
    esClaseSuelta: false,
    esMesCompleto: false,
    fecha: format(new Date(), 'yyyy-MM-dd'),
    fechaEfecto: format(new Date(), 'yyyy-MM-dd'),
    descuentoManual: 0,
});

// Nuevo estado
const [recibosPendientes, setRecibosPendientes] = useState<ReciboPendiente[]>([]);


const [filtros, setFiltros] = useState<Filtros>({
  numero: '',
  alumnoId: '',
  alumnoSueltoId: '',
  conceptoId: '',
  periodo: '',
  fueraDeTermino: '',
  esClaseSuelta: '',
  fechaDesde: '',
  fechaHasta: '',
  anulado: '',
  tipoPago: ''
});

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  useEffect(() => {
    fetchRecibos();
    fetchAlumnos();
    fetchAlumnosSueltos();
    fetchConceptos();
  }, []);

  useEffect(() => {
    calcularVistaPrevia();
  }, [nuevoRecibo, deudasSeleccionadas]);

  useEffect(() => {
    if (estiloSeleccionado) {
      const conceptosFiltrados = conceptos.filter(concepto => 
        nuevoRecibo.esClaseSuelta 
          ? concepto.nombre === 'Clase Suelta' && concepto.estiloId === parseInt(estiloSeleccionado)
          : concepto.nombre !== 'Clase Suelta' && concepto.estiloId === parseInt(estiloSeleccionado)
      );
      setConceptosFiltrados(conceptosFiltrados);
    } else {
      setConceptosFiltrados([]);
    }
  }, [estiloSeleccionado, nuevoRecibo.esClaseSuelta, conceptos]);


  const fetchRecibos = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filtros).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const res = await fetch(`/api/recibos?${queryParams}`);
      if (!res.ok) throw new Error('Error al obtener recibos');
      const data = await res.json();
      setRecibos(data);
    } catch (error) {
      console.error('Error fetching recibos:', error);
      setMessage({ text: 'Error al cargar recibos', isError: true });
    } finally {
      setLoading(false);
    }
  };

  const handleAnularRecibo = async (id: number) => {
    if (!confirm('¿Está seguro que desea anular este recibo?')) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/recibos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anulado: true }),
      });
  
      if (!res.ok) throw new Error('Error al anular el recibo');
      
      await fetchRecibos();
      setMessage({ text: 'Recibo anulado exitosamente', isError: false });
    } catch (error) {
      console.error('Error anulando recibo:', error);
      setMessage({ text: 'Error al anular el recibo', isError: true });
    } finally {
      setLoading(false);
    }
  };

  const agregarReciboPendiente = () => {
    const descuento = nuevoRecibo.descuentoManual ? 
      parseFloat(nuevoRecibo.descuentoManual.toString()) / 100 : 
      undefined; // Cambiamos null por undefined
  
    const reciboTemp: ReciboPendiente = {
      id: crypto.randomUUID(),
      alumno: alumnos.find(a => a.id === parseInt(nuevoRecibo.alumnoId)),
      alumnoSuelto: alumnosSueltos.find(a => a.id === parseInt(nuevoRecibo.alumnoSueltoId)),
      monto: parseFloat(nuevoRecibo.monto),
      fecha: nuevoRecibo.fecha,
      fechaEfecto: nuevoRecibo.fechaEfecto,
      periodoPago: nuevoRecibo.periodoPago,
      concepto: conceptos.find(c => c.id === parseInt(nuevoRecibo.conceptoId))!,
      tipoPago: nuevoRecibo.tipoPago,
      descuento, // Ahora será undefined si no hay descuento
      deudasSeleccionadas: {...deudasSeleccionadas}
    };
    
    setRecibosPendientes(prev => [...prev, reciboTemp]);
    resetForm();
  };

// Función para crear todos los recibos pendientes
const crearRecibosPendientes = async () => {
  setLoading(true);
  try {
    for (const recibo of recibosPendientes) {
      const reciboData = {
        monto: recibo.monto,
        montoOriginal: recibo.monto,
        descuento: recibo.descuento,
        periodoPago: recibo.periodoPago,
        tipoPago: recibo.tipoPago,
        fechaEfecto: recibo.fechaEfecto,
        fueraDeTermino: false,
        esClaseSuelta: false,
        esMesCompleto: true, // Importante: esto debe ser true
        alumnoId: recibo.alumno?.id,
        alumnoSueltoId: recibo.alumnoSuelto?.id,
        conceptoId: recibo.concepto.id,
        deudasAPagar: Object.entries(recibo.deudasSeleccionadas || {}).map(([deudaId, deuda]) => ({
          deudaId: parseInt(deudaId),
          monto: deuda.monto,
          estiloId: deuda.estiloId,
          periodo: deuda.periodo
        }))
      };

      const res = await fetch('/api/recibos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reciboData),
      });

      if (!res.ok) {
        throw new Error('Error al crear el recibo');
      }
    }
    
    setRecibosPendientes([]);
    fetchRecibos();
    // Importante: recargar las deudas del alumno
    if (nuevoRecibo.alumnoId) {
      fetchDeudasAlumno(nuevoRecibo.alumnoId);
    }
    setMessage({ text: 'Recibos creados exitosamente', isError: false });
  } catch (error) {
    console.error('Error:', error);
    setMessage({ text: 'Error al crear los recibos', isError: true });
  } finally {
    setLoading(false);
  }
};


  const fetchAlumnos = async () => {
    try {
      const res = await fetch('/api/alumnos');
      if (!res.ok) throw new Error('Error al obtener alumnos');
      const data = await res.json();
      setAlumnos(data);
    } catch (error) {
      console.error('Error fetching alumnos:', error);
    }
  };

  const fetchAlumnosSueltos = async () => {
    try {
      const res = await fetch('/api/alumnos-sueltos');
      if (!res.ok) throw new Error('Error al obtener alumnos sueltos');
      const data = await res.json();
      setAlumnosSueltos(data);
    } catch (error) {
      console.error('Error fetching alumnos sueltos:', error);
    }
  };

  const fetchConceptos = async () => {
    try {
      const res = await fetch('/api/conceptos');
      if (!res.ok) throw new Error('Error al obtener conceptos');
      const data = await res.json();
      setConceptos(data);
    } catch (error) {
      console.error('Error fetching conceptos:', error);
    }
  };

  const fetchDeudasAlumno = async (alumnoId: string) => {
    if (!alumnoId) {
      setDeudasAlumno([]);
      return;
    }
    
    try {
      const response = await fetch(`/api/deudas?alumnoId=${alumnoId}&pagada=false`);
      if (!response.ok) throw new Error('Error al obtener deudas');
      
      const data = await response.json();
      // Asegurarnos de que estamos usando el array de deudas de la respuesta
      setDeudasAlumno(data.deudas || []);
    } catch (error) {
      console.error('Error al cargar deudas:', error);
      setDeudasAlumno([]);
    }
  };
  

  const calcularVistaPrevia = () => {
    const montoBase = parseFloat(nuevoRecibo.monto) || 0;
    const deudasTotal = Object.values(deudasSeleccionadas).reduce(
      (sum, deuda) => sum + deuda.monto, 
      0
    );
    
    const subtotal = montoBase + deudasTotal;
    const descuentoTotal = subtotal * (nuevoRecibo.descuentoManual / 100);
    const total = subtotal - descuentoTotal;

    const deudasAPagar = Object.entries(deudasSeleccionadas).map(([id, deuda]) => ({
      id: parseInt(id),
      concepto: deudasAlumno.find(d => d.id === parseInt(id))?.estilo.nombre || 'Desconocido',
      monto: deuda.monto
    }));

    setVistaPrevia({
      subtotal,
      descuentos: descuentoTotal,
      total,
      deudasAPagar
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
  
    if (name === 'alumnoId' && value) {
      fetchDeudasAlumno(value);
      // Limpiar deudas seleccionadas al cambiar de alumno
      setDeudasSeleccionadas({});
    }

    setNuevoRecibo(prev => {
      const newState = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };

      if (name === 'esClaseSuelta') {
        newState.alumnoId = '';
        newState.alumnoSueltoId = '';
        setDeudasSeleccionadas({});
      }

      if (name === 'alumnoId' && value) {
        newState.alumnoSueltoId = '';
        newState.esClaseSuelta = false;
      }

      if (name === 'alumnoSueltoId' && value) {
        newState.alumnoId = '';
        newState.esClaseSuelta = true;
        setDeudasSeleccionadas({});
      }

      return newState;
    });
  };

  const handleDeudaSelect = (deudaId: number, checked: boolean) => {
    if (checked) {
      const deuda = deudasAlumno.find(d => d.id === deudaId);
      if (deuda) {
        setDeudasSeleccionadas(prev => ({
          ...prev,
          [deudaId]: {
            deudaId,
            monto: deuda.monto,
            montoOriginal: deuda.montoOriginal,
            estiloId: deuda.estilo.id,  // Agregar esto
            periodo: `${deuda.mes}-${deuda.anio}` // Agregar esto
          }
        }));
      }
    } else {
      setDeudasSeleccionadas(prev => {
        const newState = { ...prev };
        delete newState[deudaId];
        return newState;
      });
    }
  };

  const handleDeudaMontoChange = (deudaId: number, valor: string) => {
    const monto = parseFloat(valor);
    if (isNaN(monto)) return;

    setDeudasSeleccionadas(prev => ({
      ...prev,
      [deudaId]: {
        ...prev[deudaId],
        monto
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const reciboData = {
        ...nuevoRecibo,
        monto: vistaPrevia.total,
        montoOriginal: vistaPrevia.subtotal,
        descuento: nuevoRecibo.descuentoManual > 0 ? nuevoRecibo.descuentoManual / 100 : null,
        deudasAPagar: Object.entries(deudasSeleccionadas).map(([deudaId, deuda]) => ({
          deudaId: parseInt(deudaId),
          monto: deuda.monto
        }))
      };

      const handleClaseSueltaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        
        if (checked) {
          const conceptoClaseSuelta = conceptos.find(
            c => c.nombre === 'Clase Suelta' && 
            (estiloSeleccionado ? c.estiloId === parseInt(estiloSeleccionado) : true)
          );
    
          if (conceptoClaseSuelta) {
            setNuevoRecibo(prev => ({
              ...prev,
              esClaseSuelta: true,
              conceptoId: conceptoClaseSuelta.id.toString(),
              monto: conceptoClaseSuelta.monto.toString(),
              alumnoId: '',
            }));
          }
        } else {
          setNuevoRecibo(prev => ({
            ...prev,
            esClaseSuelta: false,
            conceptoId: '',
            monto: '',
            alumnoSueltoId: ''
          }));
        }
      };

      const res = await fetch('/api/recibos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reciboData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al crear recibo');
      }

      const reciboCreado = await res.json();
      setRecibos(prev => [reciboCreado, ...prev]);
      resetForm();
      setMessage({ text: `Recibo #${reciboCreado.numeroRecibo} creado con éxito.`, isError: false });
    } catch (error) {
      console.error('Error creating recibo:', error);
      setMessage({ text: 'Error al crear recibo', isError: true });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNuevoRecibo({
      monto: '',
      periodoPago: format(new Date(), 'yyyy-MM'),
      tipoPago: TipoPago.EFECTIVO, // Aquí también
      alumnoId: '',
      alumnoSueltoId: '',
      conceptoId: '',
      fueraDeTermino: false,
      esClaseSuelta: false,
      esMesCompleto: false,
      fecha: format(new Date(), 'yyyy-MM-dd'),
      fechaEfecto: format(new Date(), 'yyyy-MM-dd'),
      descuentoManual: 0,
    });
    setDeudasSeleccionadas({});
};


  return (
    <Container>
      <MainContent isFilterOpen={isFilterOpen}>
        <Title>Recibos</Title>
  
        {/* Formulario Principal */}
        <Form onSubmit={(e) => { e.preventDefault(); agregarReciboPendiente(); }}>
          <InputGroup>
            <InputLabel>Tipo de Alumno</InputLabel>
            <CheckboxLabel>
              <input
                type="checkbox"
                name="esClaseSuelta"
                checked={nuevoRecibo.esClaseSuelta}
                onChange={handleInputChange}
              />
              Clase Suelta
            </CheckboxLabel>
          </InputGroup>
  
          {!nuevoRecibo.esClaseSuelta ? (
            <InputGroup>
              <InputLabel>Alumno Regular</InputLabel>
              <Select
                name="alumnoId"
                value={nuevoRecibo.alumnoId}
                onChange={handleInputChange}
              >
                <option value="">Seleccione un alumno regular</option>
                {alumnos.map(alumno => (
                  <option key={alumno.id} value={alumno.id}>
                    {alumno.nombre} {alumno.apellido}
                  </option>
                ))}
              </Select>
            </InputGroup>
          ) : (
            <InputGroup>
              <InputLabel>Alumno Suelto</InputLabel>
              <Select
                name="alumnoSueltoId"
                value={nuevoRecibo.alumnoSueltoId}
                onChange={handleInputChange}
              >
                <option value="">Seleccione un alumno suelto</option>
                {alumnosSueltos.map(alumno => (
                  <option key={alumno.id} value={alumno.id}>
                    {alumno.nombre} {alumno.apellido}
                  </option>
                ))}
              </Select>
            </InputGroup>
          )}
  
          <InputGroup>
            <InputLabel>Fecha de Creación</InputLabel>
            <Input
              type="date"
              name="fecha"
              value={nuevoRecibo.fecha}
              onChange={handleInputChange}
              required
            />
          </InputGroup>
  
          <InputGroup>
            <InputLabel>Fecha de Efecto</InputLabel>
            <Input
              type="date"
              name="fechaEfecto"
              value={nuevoRecibo.fechaEfecto}
              onChange={handleInputChange}
              required
            />
          </InputGroup>
  
          <InputGroup>
            <InputLabel>Período Correspondiente</InputLabel>
            <Input
              type="month"
              name="periodoPago"
              value={nuevoRecibo.periodoPago}
              onChange={handleInputChange}
              required
            />
          </InputGroup>
  
          <InputGroup>
            <InputLabel>Concepto</InputLabel>
            <Select
              name="conceptoId"
              value={nuevoRecibo.conceptoId}
              onChange={handleInputChange}
              required
            >
              <option value="">Seleccione un concepto</option>
              {conceptos.map(concepto => (
                <option key={concepto.id} value={concepto.id}>
                  {concepto.nombre}
                </option>
              ))}
            </Select>
          </InputGroup>
  
          <InputGroup>
            <InputLabel>Monto</InputLabel>
            <Input
              type="number"
              name="monto"
              value={nuevoRecibo.monto}
              onChange={handleInputChange}
              placeholder="Monto"
              required
              step="0.01"
            />
          </InputGroup>
  
          <InputGroup>
            <InputLabel>Tipo de Pago</InputLabel>
            <Select
              name="tipoPago"
              value={nuevoRecibo.tipoPago}
              onChange={handleInputChange}
              required
            >
              <option value="">Seleccione tipo de pago</option>
              {Object.values(TipoPago).map(tipo => (
                <option key={tipo} value={tipo}>{tipo.replace('_', ' ')}</option>
              ))}
            </Select>
          </InputGroup>
  
          <InputGroup>
            <InputLabel>Puedes aplicar un descuento Manual (%)</InputLabel>
            <Input
              type="number"
              name="descuentoManual"
              value={nuevoRecibo.descuentoManual}
              onChange={handleInputChange}
              min="0"
              max="100"
              step="1"
            />
          </InputGroup>
  
          <InputGroup>
            <InputLabel>Opciones Adicionales</InputLabel>
            <CheckboxLabel>
              <input
                type="checkbox"
                name="fueraDeTermino"
                checked={nuevoRecibo.fueraDeTermino}
                onChange={handleInputChange}
              />
              Fuera de término
            </CheckboxLabel>
            <CheckboxLabel>
  <input
    type="checkbox"
    name="esMesCompleto"
    checked={nuevoRecibo.esMesCompleto}
    onChange={(e) => {
      handleInputChange(e);
      if (e.target.checked && nuevoRecibo.alumnoId) {
        // Si se marca "Mes Completo", seleccionar automáticamente todas las deudas del período
        const periodo = nuevoRecibo.periodoPago;
        const [anio, mes] = periodo.split('-');
        const deudasDelPeriodo = deudasAlumno.filter(
          d => d.mes === mes && d.anio === parseInt(anio)
        );
        deudasDelPeriodo.forEach(deuda => handleDeudaSelect(deuda.id, true));
      }
    }}
  />
  Mes Completo
</CheckboxLabel>
          </InputGroup>
          {/* Sección de Deudas */}
          {nuevoRecibo.alumnoId && !nuevoRecibo.esClaseSuelta && (
    <DeudaSection>
      <InputLabel>Deudas Pendientes</InputLabel>
      {Array.isArray(deudasAlumno) && deudasAlumno.length > 0 ? (
        deudasAlumno.map(deuda => (
          <DeudaItem key={deuda.id}>
            <CheckboxLabel>
              <input
                type="checkbox"
                checked={!!deudasSeleccionadas[deuda.id]}
                onChange={(e) => handleDeudaSelect(deuda.id, e.target.checked)}
              />
              {`${deuda.estilo.nombre} - ${deuda.mes}/${deuda.anio} - $${deuda.monto}`}
            </CheckboxLabel>
            {deudasSeleccionadas[deuda.id] && (
              <Input
                type="number"
                value={deudasSeleccionadas[deuda.id].monto}
                onChange={(e) => handleDeudaMontoChange(deuda.id, e.target.value)}
                placeholder="Monto a pagar"
                step="0.01"
                min="0"
                max={deuda.monto}
              />
            )}
          </DeudaItem>
        ))
      ) : (
        <NoDeudas>No hay deudas pendientes</NoDeudas>
      )}
    </DeudaSection>
  )}

        <Button type="submit" disabled={loading}>
          {loading ? 'Agregando...' : 'Agregar a Vista Previa'}
        </Button>
      </Form>

      {/* Vista previa de recibos pendientes */}
      {recibosPendientes.length > 0 && (
        <PreviewSection>
          <PreviewTitle>Recibos Pendientes de Crear</PreviewTitle>
          {recibosPendientes.map(recibo => (
            <PreviewReciboItem key={recibo.id}>
              <div>
                <strong>
                  {recibo.alumno 
                    ? `${recibo.alumno.nombre} ${recibo.alumno.apellido}`
                    : `${recibo.alumnoSuelto?.nombre} ${recibo.alumnoSuelto?.apellido} (Suelto)`}
                </strong>
                <div>{recibo.concepto.nombre}</div>
                <div>Período: {recibo.periodoPago}</div>
              </div>
              <div>
                <div>Monto Original: ${recibo.monto}</div>
                {recibo.descuento && <div>Descuento: {recibo.descuento}%</div>}
                <div>Monto Final: ${(recibo.monto * (1 - (recibo.descuento || 0) / 100)).toFixed(2)}</div>
              </div>
              <Button 
                onClick={() => {
                  setRecibosPendientes(prev => prev.filter(r => r.id !== recibo.id));
                }}
              >
                Eliminar
              </Button>
            </PreviewReciboItem>
          ))}
          
          <PreviewTotal>
            <span>Total a Crear:</span>
            <span>
              ${recibosPendientes.reduce((sum, r) => 
                sum + (r.monto * (1 - (r.descuento || 0) / 100)), 0
              ).toFixed(2)}
            </span>
          </PreviewTotal>
          
          <Button 
            onClick={crearRecibosPendientes} 
            disabled={loading}
            style={{ width: '100%', marginTop: '20px' }}
          >
            {loading ? 'Creando Recibos...' : 'Crear Todos los Recibos'}
          </Button>
        </PreviewSection>
      )}

      {/* Botón y Panel de Filtros */}
      <FilterToggleButton 
        onClick={() => setIsFilterOpen(!isFilterOpen)} 
        isOpen={isFilterOpen}
      >
        {isFilterOpen ? '>' : '<'} Filtros
      </FilterToggleButton>

      <FiltersPanel isOpen={isFilterOpen}>
        <CloseFiltersButton onClick={() => setIsFilterOpen(false)}>×</CloseFiltersButton>
        <FilterTitle>Filtros de Búsqueda</FilterTitle>
        <FiltersForm onSubmit={(e) => { e.preventDefault(); fetchRecibos(); }}>
          <FilterSection>
            <InputLabel>Número de Recibo</InputLabel>
            <Input
              type="number"
              name="numero"
              value={filtros.numero}
              onChange={(e) => setFiltros(prev => ({ ...prev, numero: e.target.value }))}
              placeholder="Número de recibo"
            />
          </FilterSection>

          <FilterSection>
            <InputLabel>Rango de Fechas</InputLabel>
            <Input
              type="date"
              name="fechaDesde"
              value={filtros.fechaDesde}
              onChange={(e) => setFiltros(prev => ({ ...prev, fechaDesde: e.target.value }))}
              placeholder="Fecha desde"
            />
            <Input
              type="date"
              name="fechaHasta"
              value={filtros.fechaHasta}
              onChange={(e) => setFiltros(prev => ({ ...prev, fechaHasta: e.target.value }))}
              placeholder="Fecha hasta"
            />
          </FilterSection>

          <FilterSection>
            <InputLabel>Alumno</InputLabel>
            <br />
            <Select
              name="alumnoId"
              value={filtros.alumnoId}
              onChange={(e) => setFiltros(prev => ({ ...prev, alumnoId: e.target.value }))}
            >
              <option value="">Todos los alumnos</option>
              {alumnos.map(alumno => (
                <option key={alumno.id} value={alumno.id}>
                  {alumno.nombre} {alumno.apellido}
                </option>
              ))}
            </Select>
          </FilterSection>

          <FilterSection>
            <InputLabel>Tipo de Pago</InputLabel>
            <br />
            <Select
              name="tipoPago"
              value={filtros.tipoPago}
              onChange={(e) => setFiltros(prev => ({ ...prev, tipoPago: e.target.value }))}
            >
              <option value="">Todos los tipos</option>
              {Object.values(TipoPago).map(tipo => (
                <option key={tipo} value={tipo}>{tipo.replace('_', ' ')}</option>
              ))}
            </Select>
          </FilterSection>

          <Button type="submit">Aplicar Filtros</Button>
          <Button 
            type="button" 
            onClick={() => {
              setFiltros(initialFiltros);
              fetchRecibos();
            }}
            style={{ marginTop: '10px' }}
          >
            Limpiar Filtros
          </Button>
        </FiltersForm>
      </FiltersPanel>

      {/* Tabla de Recibos */}
      <TableContainer>
        <Table>
          <thead>
            <Tr>
              <Th>Número</Th>
              <Th>Fecha</Th>
              <Th>Fecha Efecto</Th>
              <Th>Alumno</Th>
              <Th>Concepto</Th>
              <Th>Monto Original</Th>
              <Th>Descuento</Th>
              <Th>Monto Final</Th>
              <Th>Tipo de Pago</Th>
              <Th>Estado</Th>
              <Th>Acciones</Th>
            </Tr>
          </thead>
          <tbody>
            {recibos.map(recibo => (
              <Tr key={recibo.id}>
                <Td>{recibo.numeroRecibo}</Td>
                <Td>{new Date(recibo.fecha).toLocaleDateString()}</Td>
                <Td>{new Date(recibo.fechaEfecto).toLocaleDateString()}</Td>
                <Td>
                  {recibo.alumno 
                    ? `${recibo.alumno.nombre} ${recibo.alumno.apellido}`
                    : `${recibo.alumnoSuelto?.nombre} ${recibo.alumnoSuelto?.apellido} (Suelto)`}
                </Td>
                <Td>{recibo.concepto.nombre}</Td>
                <Td>${recibo.montoOriginal.toFixed(2)}</Td>
                <Td>{recibo.descuento ? `${(recibo.descuento * 100).toFixed(0)}%` : '-'}</Td>
                <Td>${recibo.monto.toFixed(2)}</Td>
                <Td>{recibo.tipoPago}</Td>
                <Td>{recibo.anulado ? 'Anulado' : 'Activo'}</Td>
                <Td>
                  {!recibo.anulado && (
                    <Button 
                      onClick={() => handleAnularRecibo(recibo.id)}
                      disabled={loading}
                    >
                      Anular
                    </Button>
                  )}
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </TableContainer>

      {message && (
        <Message isError={message.isError}>{message.text}</Message>
      )}
    </MainContent>
  </Container>
);
}

export default Recibos;