import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { usePrinter } from '@/hooks/usePrinter';
import PrinterIcon from '@heroicons/react/24/outline/PrinterIcon';
import { PrinterService } from '@/lib/printer/printer.service';
import { PrinterStatus } from '../PrinterStatus';
import { useUserRole } from '@/hooks/useUserRole';
import { getArgentinaDateTime } from '@/utils/dateUtils';

// Styled Components
const Container = styled.div`
  background-color: #FFFFFF;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: relative;
`;

const DeudaItem = styled.div`
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 4px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: white; // Asegurar contraste
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  width: 100%;

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    margin-right: 8px;
    visibility: visible;
    cursor: pointer;
  }
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

// Agregar estas reglas en tus styled components
const Form = styled.form`
  &.white-bg * {
    color: #000000 !important;
  }
`;

const DeudaSection = styled.div`
  &.white-bg * {
    color: #000000 !important;
  }
`;

const PreviewSection = styled.div`
  &.white-bg * {
    color: #000000 !important;
  }
`;

const PreviewReciboItem = styled.div`
  &.white-bg * {
    color: #000000 !important;
  }
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


const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  white-space: nowrap;
`;

const Title = styled.h2`
  color: #000000;
  margin-bottom: 20px;
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

// Nuevos Styled Components para el autocompletado
const AutocompleteContainer = styled.div`
  position: relative;
  width: 100%;
`;

const AutocompleteInput = styled(Input)`
  width: 100%;
`;

const SuggestionsList = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  max-height: 200px;
  overflow-y: auto;
  margin: 0;
  padding: 0;
  list-style: none;
  border: 1px solid #ccc;
  border-top: none;
  border-radius: 0 0 4px 4px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  z-index: 1000;
`;

const SuggestionItem = styled.li`
  padding: 8px 12px;
  cursor: pointer;
  border-bottom: 1px solid #eee;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #f5f5f5;
  }
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

const ActionButton = styled(Button)`
  width: auto;
  min-width: 160px;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
  white-space: nowrap;
  margin: 20px 0;
  
  @media (max-width: 768px) {
    width: 100%;
    padding: 14px 20px;
    font-size: 0.95em;
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  &:not(:disabled):active {
    transform: translateY(0);
  }
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
const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin: 20px 0;
`;

const PageButton = styled.button<{ isActive?: boolean }>`
  padding: 8px 12px;
  border: 1px solid ${props => props.isActive ? '#FFC001' : '#ddd'};
  background-color: ${props => props.isActive ? '#FFC001' : 'white'};
  color: ${props => props.isActive ? 'black' : '#666'};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${props => props.isActive ? '#FFC001' : '#f5f5f5'};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const PageInfo = styled.span`
  color: #666;
  font-size: 0.9em;
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
  id: number;
  monto: number;
  montoOriginal: number;
  estiloId: number | null; // Permitir que estiloId sea null
  periodo: string;
  esInscripcion: boolean;
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
  const userRole = useUserRole();
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
  const [recibosPendientes, setRecibosPendientes] = useState<ReciboPendiente[]>([]);
  const { isPrinterAvailable, printReceipt } = usePrinter();
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const deudasInscripcion = deudasAlumno.filter(d => d.concepto?.esInscripcion);
  const deudaComun = deudasAlumno.filter(d => !d.concepto?.esInscripcion);
  const [searchAlumno, setSearchAlumno] = useState('');
  const [showAlumnoSuggestions, setShowAlumnoSuggestions] = useState(false);

 
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
    fecha: format(getArgentinaDateTime(), 'yyyy-MM-dd'),
    fechaEfecto: format(getArgentinaDateTime(), 'yyyy-MM-dd'),
    descuentoManual: 0,
});

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
  const [mostrarSoloInscripcion, setMostrarSoloInscripcion] = useState(false);
  const [showPrinterAlert, setShowPrinterAlert] = useState(true);

  

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleFiltros = (newFiltros: Filtros) => {
    setCurrentPage(1); // Resetear a la primera página
    setFiltros(newFiltros);
    fetchRecibos(); // Llamar a fetchRecibos inmediatamente
  };

  const ITEMS_PER_PAGE = 15;
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1, // Cambiar de 0 a 1 para evitar NaN
    currentPage: 1,
    itemsPerPage: ITEMS_PER_PAGE
  });

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


  const fetchRecibos = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      
      // Agregar parámetros de paginación
      queryParams.append('page', currentPage.toString());
      queryParams.append('limit', ITEMS_PER_PAGE.toString());
      
      // Agregar otros filtros
      Object.entries(filtros).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const res = await fetch(`/api/recibos?${queryParams}`);
      if (!res.ok) throw new Error('Error al obtener recibos');
      
      const data = await res.json();
      
      if (data.recibos && Array.isArray(data.recibos)) {
        setRecibos(data.recibos);
        setPagination({
          total: data.pagination.total || 0,
          pages: Math.max(1, data.pagination.pages) || 1, // Asegurar mínimo 1 página
          currentPage: data.pagination.currentPage || 1,
          itemsPerPage: ITEMS_PER_PAGE
        });
        
        // Si la página actual es mayor que el total de páginas, resetear a la página 1
        if (data.pagination.currentPage > data.pagination.pages) {
          setCurrentPage(1);
        }
      }
      
    } catch (error) {
      console.error('Error fetching recibos:', error);
      setMessage({ text: 'Error al cargar recibos', isError: true });
    } finally {
      setLoading(false);
    }
  }, [currentPage, filtros, ITEMS_PER_PAGE]);
  
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

  const handleEliminarRecibo = async (id: number) => {
    if (!confirm('¿Está seguro que desea eliminar definitivamente este recibo?')) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/recibos/${id}`, {
        method: 'DELETE'
      });
  
      if (!res.ok) throw new Error('Error al eliminar el recibo');
      
      await fetchRecibos();
      setMessage({ text: 'Recibo eliminado exitosamente', isError: false });
    } catch (error) {
      console.error('Error eliminando recibo:', error);
      setMessage({ text: 'Error al eliminar el recibo', isError: true });
    } finally {
      setLoading(false);
    }
  };

  
// En el componente Recibos.tsx - Función agregarReciboPendiente corregida
const agregarReciboPendiente = () => {
  setLoading(true);
  try {
    // ✅ VALIDACIONES MEJORADAS EN EL FRONTEND
    
    // Validar que hay un alumno seleccionado
    if (!nuevoRecibo.alumnoId && !nuevoRecibo.alumnoSueltoId) {
      setMessage({ 
        text: 'Debe seleccionar un alumno regular o un alumno suelto', 
        isError: true 
      });
      setLoading(false);
      return;
    }

    // Validar que hay un concepto seleccionado
    if (!nuevoRecibo.conceptoId) {
      setMessage({ 
        text: 'Debe seleccionar un concepto', 
        isError: true 
      });
      setLoading(false);
      return;
    }

    // Validar que hay un monto válido
    if (!nuevoRecibo.monto || parseFloat(nuevoRecibo.monto) <= 0) {
      setMessage({ 
        text: 'Debe ingresar un monto válido', 
        isError: true 
      });
      setLoading(false);
      return;
    }

    // ✅ MANEJAR IDs COMO NÚMEROS PARA EVITAR PROBLEMAS DE TIPO
    const alumnoIdLimpio = nuevoRecibo.alumnoId && nuevoRecibo.alumnoId !== '' 
      ? parseInt(nuevoRecibo.alumnoId) 
      : null;
    
    const alumnoSueltoIdLimpio = nuevoRecibo.alumnoSueltoId && nuevoRecibo.alumnoSueltoId !== '' 
      ? parseInt(nuevoRecibo.alumnoSueltoId) 
      : null;

    // Validar que los IDs parseados son válidos
    if (nuevoRecibo.alumnoId && (isNaN(alumnoIdLimpio!) || alumnoIdLimpio! <= 0)) {
      setMessage({ 
        text: 'ID de alumno no válido', 
        isError: true 
      });
      setLoading(false);
      return;
    }

    if (nuevoRecibo.alumnoSueltoId && (isNaN(alumnoSueltoIdLimpio!) || alumnoSueltoIdLimpio! <= 0)) {
      setMessage({ 
        text: 'ID de alumno suelto no válido', 
        isError: true 
      });
      setLoading(false);
      return;
    }

    const descuento = nuevoRecibo.descuentoManual ? 
      nuevoRecibo.descuentoManual : 
      undefined;
    
    const reciboTemp: ReciboPendiente = {
      id: crypto.randomUUID(),
      alumno: alumnoIdLimpio ? alumnos.find(a => a.id === alumnoIdLimpio) : undefined,
      alumnoSuelto: alumnoSueltoIdLimpio ? alumnosSueltos.find(a => a.id === alumnoSueltoIdLimpio) : undefined,
      monto: parseFloat(nuevoRecibo.monto),
      fecha: nuevoRecibo.fecha,
      fechaEfecto: nuevoRecibo.fechaEfecto,
      periodoPago: nuevoRecibo.periodoPago,
      concepto: conceptos.find(c => c.id === parseInt(nuevoRecibo.conceptoId))!,
      tipoPago: nuevoRecibo.tipoPago,
      descuento,
      deudasSeleccionadas: {...deudasSeleccionadas}
    };
    
    setRecibosPendientes(prev => [...prev, reciboTemp]);
    resetForm();
  } catch (error) {
    console.error('Error:', error);
    setMessage({ 
      text: 'Error al procesar el recibo', 
      isError: true 
    });
  } finally {
    setLoading(false);
  }
};

// ✅ FUNCIÓN crearRecibosPendientes MEJORADA
const crearRecibosPendientes = async () => {
  setLoading(true);
  try {
    for (const recibo of recibosPendientes) {
      // Validar recibo antes de enviarlo
      if (!recibo.alumno && !recibo.alumnoSuelto) {
        console.error('Recibo sin alumno válido:', recibo);
        continue;
      }

      if (!recibo.concepto || !recibo.concepto.id) {
        console.error('Recibo sin concepto válido:', recibo);
        continue;
      }

      // Calculamos el monto final con el descuento aplicado
      const descuentoDecimal = recibo.descuento ? (recibo.descuento / 100) : 0;
      const montoFinal = recibo.monto * (1 - descuentoDecimal);
      
      // Determinar si es una clase suelta
      const esClaseSueltaPorConcepto = recibo.concepto.nombre.toLowerCase().includes('suelta');
      const esClaseSueltaPorMonto = recibo.monto === 15000;
      const esClaseSueltaPorAlumno = !!recibo.alumnoSuelto;
      const esClaseSuelta = esClaseSueltaPorConcepto || esClaseSueltaPorMonto || esClaseSueltaPorAlumno;
      
      // ✅ PREPARAR DATOS CON TIPOS CORRECTOS
      const reciboData: any = {
        monto: montoFinal,
        montoOriginal: recibo.monto,
        descuento: descuentoDecimal,
        periodoPago: recibo.periodoPago,
        tipoPago: recibo.tipoPago,
        fecha: recibo.fecha,
        fechaEfecto: recibo.fechaEfecto,
        fueraDeTermino: false,
        esClaseSuelta: esClaseSuelta,
        esMesCompleto: true,
        conceptoId: recibo.concepto.id, // Ya es número
        deudasAPagar: Object.entries(recibo.deudasSeleccionadas || {}).map(([deudaId, deuda]) => ({
          deudaId: parseInt(deudaId),
          monto: deuda.monto,
          estiloId: deuda.estiloId,
          periodo: deuda.periodo,
          esInscripcion: deuda.esInscripcion
        }))
      };

      // ✅ AGREGAR SOLO EL ID QUE CORRESPONDE COMO NÚMERO
      if (recibo.alumno?.id) {
        reciboData.alumnoId = recibo.alumno.id; // Ya es número
      } else if (recibo.alumnoSuelto?.id) {
        reciboData.alumnoSueltoId = recibo.alumnoSuelto.id; // Ya es número
      }

      console.log('Enviando recibo:', reciboData);

      const res = await fetch('/api/recibos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reciboData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al crear el recibo');
      }

      const reciboCreado = await res.json();
      
      // Intentar imprimir si la impresora está disponible
      if (isPrinterAvailable) {
        try {
          const printResult = await printReceipt(reciboCreado);
          console.log('Resultado de impresión:', printResult);
          
          if (!printResult.success) {
            console.warn('Detalles del error de impresión:', printResult.message);
          }
        } catch (printError) {
          console.error('Error al imprimir:', printError);
        }
      }
    }
    
    setRecibosPendientes([]);
    fetchRecibos();
    if (nuevoRecibo.alumnoId) {
      fetchDeudasAlumno(nuevoRecibo.alumnoId);
    }
    setMessage({ 
      text: 'Recibos creados exitosamente' + 
        (!isPrinterAvailable ? ' (Impresora no disponible)' : ''), 
      isError: false 
    });
  } catch (error) {
    console.error('Error:', error);
    setMessage({ 
      text: error instanceof Error ? error.message : 'Error al crear los recibos', 
      isError: true 
    });
  } finally {
    setLoading(false);
  }
};

      useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
          const target = event.target as HTMLElement;
          if (!target.closest('.autocomplete-container')) {
            setShowSuggestions(false);
          }
        };
      
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
      }, []);

// En la función fetchAlumnos
const fetchAlumnos = async () => {
  try {
    const res = await fetch('/api/alumnos');
    if (!res.ok) throw new Error('Error al obtener alumnos');
    const data = await res.json();
    // Filtrar solo alumnos activos antes de setear el estado
    const alumnosActivos = data.filter((alumno: Alumno) => alumno.activo);
    setAlumnos(alumnosActivos);
  } catch (error) {
    console.error('Error fetching alumnos:', error);
  }
};

// En el useMemo de filteredAlumnosForm
const filteredAlumnosForm = useMemo(() => {
  if (!searchAlumno) return [];
  const searchTermLower = searchAlumno.toLowerCase();
  return (nuevoRecibo.esClaseSuelta ? alumnosSueltos : alumnos)
    .filter(alumno => 
      `${alumno.apellido} ${alumno.nombre}`.toLowerCase().includes(searchTermLower)
    );
}, [searchAlumno, alumnos, alumnosSueltos, nuevoRecibo.esClaseSuelta]);

// También en filteredAlumnos para el panel de filtros
const filteredAlumnos = useMemo(() => {
  if (!searchTerm) return [];
  const searchTermLower = searchTerm.toLowerCase();
  return alumnos
    .filter(alumno => 
      `${alumno.apellido} ${alumno.nombre}`.toLowerCase().includes(searchTermLower) &&
      alumno.activo
    );
}, [searchTerm, alumnos]);

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
      console.log('Deudas recibidas:', data); // Para debug
      
      // Ordenar las deudas para que la inscripción aparezca primero
      const deudasOrdenadas = (data.deudas || []).sort((a: Deuda, b: Deuda) => {
        if (a.concepto?.esInscripcion) return -1;
        if (b.concepto?.esInscripcion) return 1;
        return 0;
      });
  
      setDeudasAlumno(deudasOrdenadas);
  
      // Si hay deuda de inscripción, mostrar mensaje
      const deudaInscripcion = deudasOrdenadas.find((d: { concepto: { esInscripcion: any; }; }) => d.concepto?.esInscripcion);
      if (deudaInscripcion) {
        setMessage({
          text: 'Este alumno tiene pendiente el pago de inscripción',
          isError: true
        });
      }
    } catch (error) {
      console.error('Error al cargar deudas:', error);
      setDeudasAlumno([]);
    }
  };


const getNombreEstilo = (deuda: Deuda) => {
  if (deuda.estilo) return deuda.estilo.nombre;
  if (deuda.estiloNombre) return deuda.estiloNombre;
  if (deuda.concepto?.esInscripcion) return "Inscripción";
  return deuda.tipoDeuda === "SUELTA" ? "Clase suelta" : "Sin estilo";
};

const calcularVistaPrevia = () => {
  const montoBase = parseFloat(nuevoRecibo.monto) || 0;
  const deudasTotal = Object.values(deudasSeleccionadas).reduce(
    (sum, deuda) => sum + deuda.monto, 
    0
  );
  
  const subtotal = montoBase + deudasTotal;
  const descuentoTotal = subtotal * (parseFloat(nuevoRecibo.descuentoManual.toString()) / 100);
  const total = subtotal - descuentoTotal;

  const deudasAPagar = Object.entries(deudasSeleccionadas).map(([id, deuda]) => {
    const deudaOriginal = deudasAlumno.find(d => d.id === parseInt(id));
    let nombreConcepto = 'Desconocido';
    
    if (deudaOriginal) {
      if (deudaOriginal.concepto?.esInscripcion) {
        nombreConcepto = "Inscripción";
      } else if (deudaOriginal.estilo) {
        nombreConcepto = deudaOriginal.estilo.nombre;
      } else if (deudaOriginal.tipoDeuda === "SUELTA") {
        nombreConcepto = "Clase Suelta";
      } else {
        nombreConcepto = "Sin estilo";
      }
    }
    
    return {
      id: parseInt(id),
      concepto: nombreConcepto,
      monto: deuda.monto
    };
  });

  setVistaPrevia({
    subtotal,
    descuentos: descuentoTotal,
    total,
    deudasAPagar
  });
};

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.autocomplete-container')) {
        setShowAlumnoSuggestions(false);
      }
    };
  
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
  
    if (name === 'alumnoId' && value) {
      fetchDeudasAlumno(value);
      setDeudasSeleccionadas({}); // Limpiar las deudas seleccionadas
    }
  
    setNuevoRecibo(prev => {
      const newState = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };
  
      if (name === 'fecha') {
        newState.fechaEfecto = value;
      }
  
      // No modificamos esClaseSuelta cuando cambiamos de tipo de alumno
      // y no modificamos el tipo de alumno cuando cambiamos esClaseSuelta
      
      if (name === 'alumnoId' && value) {
        newState.alumnoSueltoId = '';
        // No cambiamos esClaseSuelta aquí
      }
  
      if (name === 'alumnoSueltoId' && value) {
        newState.alumnoId = '';
        // No cambiamos esClaseSuelta aquí
      }
  
      // Eliminamos la condición que reestablecía los alumnos al marcar esClaseSuelta
      // Al quitar esto, ya no se resetea el alumno al marcar/desmarcar el checkbox
  
      return newState;
    });
  };

  const handleDeudaSelect = (deudaId: number, checked: boolean) => {
    if (checked) {
      const deuda = deudasAlumno.find(d => d.id === deudaId);
      if (deuda) {
        if (deuda.concepto?.esInscripcion) {
          // Si es inscripción, usar el concepto de inscripción
          const conceptoInscripcion = conceptos.find(c => c.esInscripcion);
          setNuevoRecibo(prev => ({
            ...prev,
            conceptoId: conceptoInscripcion?.id.toString() || '',
            monto: deuda.monto.toString()
          }));
        }
  
        setDeudasSeleccionadas(prev => ({
          ...prev,
          [deudaId]: {
            id: deudaId,
            monto: deuda.monto,
            montoOriginal: deuda.montoOriginal || deuda.monto,
            estiloId: deuda.estilo?.id || null, // Permitir null
            periodo: `${deuda.mes}-${deuda.anio}`,
            esInscripcion: deuda.concepto?.esInscripcion || false
          }
        }));
      }
    } else {
      setDeudasSeleccionadas(prev => {
        const newState = { ...prev };
        const deudaRemovida = deudasAlumno.find(d => d.id === deudaId);
        
        // Si se desmarca inscripción, limpiar concepto
        if (deudaRemovida?.concepto?.esInscripcion) {
          setNuevoRecibo(prev => ({
            ...prev,
            conceptoId: '',
            monto: ''
          }));
        }
        
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

  const resetForm = () => {
    setNuevoRecibo(prev => ({
      monto: '',
      periodoPago: format(new Date(), 'yyyy-MM'),
      tipoPago: TipoPago.EFECTIVO,
      // Mantenemos los datos del alumno
      alumnoId: prev.alumnoId,
      alumnoSueltoId: prev.alumnoSueltoId,
      esClaseSuelta: prev.esClaseSuelta,
      // Reseteamos el resto de campos
      conceptoId: '',
      fueraDeTermino: false,
      esMesCompleto: false,
      fecha: format(new Date(), 'yyyy-MM-dd'),
      fechaEfecto: format(new Date(), 'yyyy-MM-dd'),
      descuentoManual: 0,
    }));
    
    // No reseteamos las deudas seleccionadas si hay un alumno
    if (!nuevoRecibo.alumnoId && !nuevoRecibo.alumnoSueltoId) {
      setDeudasSeleccionadas({});
    }
  };

useEffect(() => {
  fetchRecibos();
}, [currentPage, fetchRecibos]);

// Agrega un useEffect separado para resetear la página cuando cambian los filtros
useEffect(() => {
  setCurrentPage(1);
}, [filtros]);

return (
  <Container>
    <MainContent isFilterOpen={isFilterOpen}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Title>Recibos</Title>
        {showPrinterAlert && (
        <PrinterStatus 
          isAvailable={isPrinterAvailable}
          onClose={() => setShowPrinterAlert(false)}
        />
      )}
          <Button
            onClick={async () => {
              const service = new PrinterService();
              const isAvailable = await service.detectPrinter();
              setMessage({
                text: isAvailable ? 'Impresora detectada y lista' : 'Impresora no encontrada',
                isError: !isAvailable
              });
            }}
            style={{ 
              padding: '5px 10px',
              fontSize: '0.9em',
              backgroundColor: 'transparent',
              color: isPrinterAvailable ? '#2e7d32' : '#856404',
              border: `1px solid ${isPrinterAvailable ? '#4caf50' : '#ffc107'}`
            }}
          >
            Verificar Impresora
          </Button>
        </div>
        {/* Formulario Principal */}
        <Form className="white-bg" onSubmit={(e) => { e.preventDefault(); agregarReciboPendiente(); }}>
          {!nuevoRecibo.esClaseSuelta ? (
  <InputGroup>
    <InputLabel>Alumno</InputLabel>
    <AutocompleteContainer className="autocomplete-container">
      <AutocompleteInput
        type="text"
        value={searchAlumno}
        onChange={(e) => {
          setSearchAlumno(e.target.value);
          setShowAlumnoSuggestions(true);
          if (nuevoRecibo.alumnoId) {
            setNuevoRecibo(prev => ({ ...prev, alumnoId: '' }));
            setDeudasSeleccionadas({});
          }
        }}
        onFocus={() => setShowAlumnoSuggestions(true)}
        placeholder="Buscar alumno por apellido..."
      />
      {showAlumnoSuggestions && searchAlumno && (
        <SuggestionsList>
          {filteredAlumnosForm.length > 0 ? (
            filteredAlumnosForm.map(alumno => (
              <SuggestionItem
                key={alumno.id}
                onClick={() => {
                  setNuevoRecibo(prev => ({ 
                    ...prev, 
                    alumnoId: alumno.id.toString() 
                  }));
                  setSearchAlumno(`${alumno.apellido} ${alumno.nombre}`);
                  setShowAlumnoSuggestions(false);
                  fetchDeudasAlumno(alumno.id.toString());
                }}
              >
                {alumno.apellido} {alumno.nombre}
              </SuggestionItem>
            ))
          ) : (
            <SuggestionItem>No se encontraron alumnos</SuggestionItem>
          )}
        </SuggestionsList>
      )}
    </AutocompleteContainer>
  </InputGroup>
) : (
  <InputGroup>
    <InputLabel>Alumno Suelto</InputLabel>
    <AutocompleteContainer className="autocomplete-container">
      <AutocompleteInput
        type="text"
        value={searchAlumno}
        onChange={(e) => {
          setSearchAlumno(e.target.value);
          setShowAlumnoSuggestions(true);
          if (nuevoRecibo.alumnoSueltoId) {
            setNuevoRecibo(prev => ({ ...prev, alumnoSueltoId: '' }));
          }
        }}
        onFocus={() => setShowAlumnoSuggestions(true)}
        placeholder="Buscar alumno suelto por apellido..."
      />
      {showAlumnoSuggestions && searchAlumno && (
        <SuggestionsList>
          {filteredAlumnosForm.length > 0 ? (
            filteredAlumnosForm.map(alumno => (
              <SuggestionItem
                key={alumno.id}
                onClick={() => {
                  setNuevoRecibo(prev => ({ 
                    ...prev, 
                    alumnoSueltoId: alumno.id.toString() 
                  }));
                  setSearchAlumno(`${alumno.apellido} ${alumno.nombre}`);
                  setShowAlumnoSuggestions(false);
                }}
              >
                {alumno.apellido} {alumno.nombre}
              </SuggestionItem>
            ))
          ) : (
            <SuggestionItem>No se encontraron alumnos sueltos</SuggestionItem>
          )}
        </SuggestionsList>
      )}
    </AutocompleteContainer>
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
    onChange={(e) => {
      const value = Math.min(Math.max(0, parseInt(e.target.value) || 0), 100);
      setNuevoRecibo(prev => ({ ...prev, descuentoManual: value }));
    }}
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
<CheckboxLabel>
  <input
    type="checkbox"
    name="esClaseSuelta"
    checked={nuevoRecibo.esClaseSuelta}
    onChange={handleInputChange}
  />
  Clase Suelta {nuevoRecibo.alumnoSueltoId && "(recomendado para alumnos sueltos)"}
</CheckboxLabel>
          </InputGroup>

          {nuevoRecibo.alumnoId && (
  <DeudaSection className="white-bg">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
      <InputLabel>Deudas Pendientes</InputLabel>
      <CheckboxLabel>
        <input
          type="checkbox"
          checked={mostrarSoloInscripcion}
          onChange={(e) => setMostrarSoloInscripcion(e.target.checked)}
        />
        Ver solo inscripción
      </CheckboxLabel>
    </div>

   {/* Sección de Inscripción */}
   <div style={{ marginBottom: '20px' }}>
     {deudasAlumno.filter(d => d.concepto?.esInscripcion && !d.pagada).map(deuda => (
       <div key={deuda.id} style={{
         padding: '15px',
         backgroundColor: '#fff3cd',
         border: '1px solid #ffeeba',
         borderRadius: '4px',
         marginBottom: '10px',
         display: 'flex',
         justifyContent: 'space-between',
         alignItems: 'center'
       }}>
         <span style={{ color: '#856404' }}>
           Inscripción pendiente - ${deuda.monto}
         </span>
         <Button
           onClick={() => handleDeudaSelect(deuda.id, true)}
           style={{
             backgroundColor: '#ffc107',
             color: '#000'
           }}
         >
           Seleccionar para Pago
         </Button>
       </div>
     ))}
   </div>

   {/* Listado de deudas */}
   {Array.isArray(deudasAlumno) && deudasAlumno.length > 0 ? (
     <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
{deudasAlumno
  .filter(deuda => !mostrarSoloInscripcion || deuda.concepto?.esInscripcion)
  .map(deuda => (
    <DeudaItem 
      key={deuda.id}
      style={{
        backgroundColor: deuda.concepto?.esInscripcion ? '#fff3cd' : 'white',
        border: deuda.concepto?.esInscripcion ? '2px solid #ffc107' : '1px solid #eee'
      }}
    >
      <div style={{ flex: 1 }}>
        <CheckboxLabel>
          <input
            type="checkbox"
            checked={!!deudasSeleccionadas[deuda.id]}
            onChange={(e) => handleDeudaSelect(deuda.id, e.target.checked)}
          />
          <span style={{
            fontWeight: deuda.concepto?.esInscripcion ? 'bold' : 'normal',
            color: deuda.concepto?.esInscripcion ? '#856404' : 'inherit'
          }}>
                   {deuda.concepto?.esInscripcion 
                     ? `INSCRIPCIÓN - $${deuda.monto}`
                     : `${deuda.estilo.nombre} - ${deuda.mes}/${deuda.anio} - $${deuda.monto}`}
                 </span>
               </CheckboxLabel>

               {deuda.fechaVencimiento && new Date(deuda.fechaVencimiento) < new Date() && (
                 <span style={{ 
                   color: '#dc3545', 
                   fontSize: '0.9em',
                   marginLeft: '10px'
                 }}>
                   Vencida
                 </span>
               )}
             </div>

             {deudasSeleccionadas[deuda.id] && (
               <div style={{ width: '150px' }}>
                 <Input
                   type="number"
                   value={deudasSeleccionadas[deuda.id].monto}
                   onChange={(e) => handleDeudaMontoChange(deuda.id, e.target.value)}
                   placeholder="Monto a pagar"
                   step="0.01"
                   min="0"
                   max={deuda.monto}
                 />
               </div>
             )}
           </DeudaItem>
         ))}
     </div>
   ) : (
     <NoDeudas>No hay deudas pendientes</NoDeudas>
   )}

   {/* Resumen de deudas seleccionadas */}
   {Object.keys(deudasSeleccionadas).length > 0 && (
     <div style={{ 
       marginTop: '20px', 
       padding: '15px',
       backgroundColor: '#f8f9fa',
       borderRadius: '4px'
     }}>
       <h4 style={{ marginBottom: '10px' }}>Resumen de Deudas Seleccionadas</h4>
       <div style={{ 
         display: 'flex', 
         flexDirection: 'column',
         gap: '5px'
       }}>
{Object.entries(deudasSeleccionadas).map(([deudaId, deuda]) => {
  const deudaOriginal = deudasAlumno.find(d => d.id === parseInt(deudaId));
  return (
    <div key={deudaId} style={{ 
      display: 'flex', 
      justifyContent: 'space-between'
    }}>
      <span>
        {deuda.esInscripcion ? 'INSCRIPCIÓN' : 
          `${deudaOriginal ? getNombreEstilo(deudaOriginal) : 'Concepto'} - 
          ${deudaOriginal?.mes || '?'}/
          ${deudaOriginal?.anio || '?'}`
        }
      </span>
      <span>${deuda.monto}</span>
    </div>
  );
})}
         <div style={{ 
           borderTop: '1px solid #dee2e6',
           marginTop: '10px',
           paddingTop: '10px',
           fontWeight: 'bold'
         }}>
           <span>Total:</span>
           <span>
             ${Object.values(deudasSeleccionadas)
               .reduce((sum, deuda) => sum + deuda.monto, 0)
               .toFixed(2)}
           </span>
         </div>
       </div>
     </div>
   )}
 </DeudaSection>
)}

<ActionButton 
  type="submit" 
  disabled={loading}
  style={{
    backgroundColor: loading ? '#cccccc' : '#FFC001',
    color: loading ? '#666666' : '#000000',
  }}
>
  {loading ? (
    <>
      <span className="spinner" style={{
        display: 'inline-block',
        width: '16px',
        height: '16px',
        border: '2px solid #666666',
        borderTop: '2px solid transparent',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }}></span>
      Agregando...
    </>
  ) : (
    <>
      <svg 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M12 5v14M5 12h14"/>
      </svg>
      Agregar a Vista Previa
    </>
  )}
</ActionButton>
      </Form>

{/* Vista previa de recibos pendientes con mejoras visuales */}
{recibosPendientes.length > 0 && (
  <PreviewSection className="white-bg">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
      <PreviewTitle>Recibos Pendientes de Crear</PreviewTitle>
      <span style={{ color: '#666' }}>
        {recibosPendientes.length} {recibosPendientes.length === 1 ? 'recibo' : 'recibos'} pendiente{recibosPendientes.length !== 1 && 's'}
      </span>
    </div>

    {recibosPendientes.map(recibo => (
      <PreviewReciboItem key={recibo.id}>
        <div style={{ flex: 1 }}>
          <strong style={{ fontSize: '1.1em' }}>
            {recibo.alumno 
              ? `${recibo.alumno.nombre} ${recibo.alumno.apellido}`
              : `${recibo.alumnoSuelto?.nombre} ${recibo.alumnoSuelto?.apellido} (Suelto)`}
          </strong>
          <div style={{ color: '#666', marginTop: '5px' }}>
            <div>{recibo.concepto.nombre}</div>
            <div>Período: {recibo.periodoPago}</div>
          </div>
        </div>

        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'flex-end',
          minWidth: '200px'
        }}>
          <div>Monto Original: ${recibo.monto.toFixed(0)}</div>
          {recibo.descuento && (
            <div style={{ color: '#4caf50' }}>
              Descuento: {recibo.descuento}%
            </div>
          )}
<div style={{ 
  fontWeight: 'bold', 
  fontSize: '1.1em', 
  marginTop: '5px' 
}}>
  Monto Final: ${(recibo.monto * (1 - (recibo.descuento || 0) / 100)).toFixed(0)}
</div>
          {isPrinterAvailable && (
            <div style={{ 
              color: '#666', 
              fontSize: '0.9em', 
              marginTop: '5px' 
            }}>
              ✓ Se imprimirá automáticamente
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Button 
            onClick={() => {
              setRecibosPendientes(prev => prev.filter(r => r.id !== recibo.id));
            }}
            style={{
              backgroundColor: '#ff4444',
              color: 'white'
            }}
          >
            Eliminar
          </Button>
        </div>
      </PreviewReciboItem>
    ))}

    <PreviewTotal className="white-bg">
      <div>
        <span>Total a Crear:</span>
        <div style={{ color: '#666', fontSize: '0.9em', marginTop: '5px' }}>
          {recibosPendientes.length} {recibosPendientes.length === 1 ? 'recibo' : 'recibos'}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
      <span style={{ fontSize: '1.2em', fontWeight: 'bold' }}>
  ${recibosPendientes.reduce((sum, r) => 
    sum + (r.monto * (1 - (r.descuento || 0) / 100)), 0
  ).toFixed(0)}
</span>
      </div>
    </PreviewTotal>

    <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
      <Button 
        onClick={() => setRecibosPendientes([])}
        style={{ 
          backgroundColor: '#f5f5f5', 
          color: '#666'
        }}
      >
        Cancelar Todo
      </Button>
      <Button 
        onClick={crearRecibosPendientes} 
        disabled={loading}
        style={{ 
          width: 'auto',
          backgroundColor: '#4CAF50',
          color: 'white',
          padding: '15px 30px'
        }}
      >
        {loading ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <PrinterIcon /> Creando Recibos...
          </span>
        ) : (
          <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isPrinterAvailable ? '🖨️' : '💾'} Crear y {isPrinterAvailable ? 'Imprimir' : 'Guardar'} Recibos
          </span>
        )}
      </Button>
    </div>
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
  <AutocompleteContainer>
    <AutocompleteInput
      type="text"
      value={searchTerm}
      onChange={(e) => {
        setSearchTerm(e.target.value);
        setShowSuggestions(true);
      }}
      onFocus={() => setShowSuggestions(true)}
      placeholder="Buscar por apellido..."
    />
    {showSuggestions && searchTerm && (
      <SuggestionsList>
        {filteredAlumnos.map(alumno => (
          <SuggestionItem
            key={alumno.id}
            onClick={() => {
              setFiltros(prev => ({ ...prev, alumnoId: alumno.id.toString() }));
              setSearchTerm(`${alumno.apellido} ${alumno.nombre}`);
              setShowSuggestions(false);
            }}
          >
            {alumno.apellido} {alumno.nombre}
          </SuggestionItem>
        ))}
        {filteredAlumnos.length === 0 && (
          <SuggestionItem>No se encontraron alumnos</SuggestionItem>
        )}
      </SuggestionsList>
    )}
  </AutocompleteContainer>
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
    setCurrentPage(1);
    setFiltros(initialFiltros);
    setSearchTerm(''); // Limpiar también el término de búsqueda
    fetchRecibos();
  }}
  style={{ marginTop: '10px' }}
>
  Limpiar Filtros
</Button>
        </FiltersForm>
      </FiltersPanel>


<PaginationContainer>
  <PageButton 
    onClick={() => handlePageChange(1)} 
    disabled={pagination.currentPage === 1 || loading}
  >
    {'<<'}
  </PageButton>
  
  <PageButton 
    onClick={() => handlePageChange(Math.max(1, pagination.currentPage - 1))}
    disabled={pagination.currentPage === 1 || loading}
  >
    {'<'}
  </PageButton>
  
  <PageInfo>
    Página {pagination.currentPage} de {pagination.pages || 1} 
    ({pagination.total} recibos en total)
  </PageInfo>
  
  <PageButton 
    onClick={() => handlePageChange(Math.min(pagination.pages, pagination.currentPage + 1))}
    disabled={pagination.currentPage === pagination.pages || loading}
  >
    {'>'}
  </PageButton>
  
  <PageButton 
    onClick={() => handlePageChange(pagination.pages)}
    disabled={pagination.currentPage === pagination.pages || loading}
  >
    {'>>'}
  </PageButton>
</PaginationContainer>

{/* Tabla de Recibos Mejorada */}
<TableContainer>
  <div style={{ 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '20px' 
  }}>
    <h3>Recibos Generados</h3>
    <div style={{ color: '#666' }}>
      Total: {recibos.length} recibos
    </div>
  </div>

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
  <Td>
    ${recibo.montoOriginal ? recibo.montoOriginal.toFixed(0) : 
      (recibo.monto / (1 - (recibo.descuento || 0))).toFixed(0)}
  </Td>
  <Td style={{ 
    color: recibo.descuento ? '#2e7d32' : 'inherit',
    fontWeight: recibo.descuento ? 'bold' : 'normal'
  }}>
    {recibo.descuento ? `${(recibo.descuento * 100).toFixed(0)}%` : '-'}
  </Td>
  <Td style={{ fontWeight: 'bold' }}>
    ${recibo.monto.toFixed(0)}
  </Td>
  <Td>{recibo.tipoPago}</Td>
          <Td>
            <span style={{
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '0.85em',
              backgroundColor: recibo.anulado ? '#ffebee' : '#e8f5e9',
              color: recibo.anulado ? '#c62828' : '#2e7d32'
            }}>
              {recibo.anulado ? 'Anulado' : 'Activo'}
            </span>
          </Td>
          <Td style={{ display: 'flex', gap: '5px' }}>
    {recibo.anulado ? (
      userRole === 'Dueño' && (
        <Button 
          onClick={() => handleEliminarRecibo(recibo.id)}
          disabled={loading}
          style={{
            backgroundColor: '#dc3545',
            color: 'white',
            padding: '5px 10px',
            fontSize: '0.9em'
          }}
        >
          Eliminar
        </Button>
      )
    ) : (
      <>
        <Button 
          onClick={() => handleAnularRecibo(recibo.id)}
          disabled={loading}
          style={{
            backgroundColor: '#ff4444',
            color: 'white',
            padding: '5px 10px',
            fontSize: '0.9em'
          }}
        >
          Anular
        </Button>
        {isPrinterAvailable && (
          <Button
            onClick={() => printReceipt(recibo)}
            disabled={loading}
            style={{
              backgroundColor: '#4CAF50',
              color: 'white',
              padding: '5px 10px',
              fontSize: '0.9em'
            }}
          >
            Reimprimir
          </Button>
        )}
      </>
    )}
  </Td>
        </Tr>
      ))}
    </tbody>
  </Table>
</TableContainer>

{/* Mensajes de Estado */}
{message && (
  <Message 
    isError={message.isError}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 1000,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}

  >
    {message.isError ? '❌' : '✅'} {message.text}
  </Message>
)}
</MainContent>
</Container>
);
}

export default Recibos;