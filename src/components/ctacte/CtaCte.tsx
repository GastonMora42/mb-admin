// components/CtaCte/index.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

// Interfaces
interface Alumno {
  id: number;
  nombre: string;
  apellido: string;
  esAlumnoSuelto?: boolean;
  ctaCte?: {
    saldo: number;
  };
  deudas?: Deuda[];
  alumnoEstilos?: {
    estilo: {
      nombre: string;
      monto: number;
    };
  }[];
  descuentosVigentes?: {
    descuento: {
      esAutomatico: boolean;
      porcentaje: number;
    };
  }[];
}

interface Deuda {
  id: number;
  monto: number;
  montoOriginal: number;
  mes: string;
  anio: number;
  pagada: boolean;
  fechaPago: string | null;
  fechaVencimiento: string;
  estilo?: {
    id: number;
    nombre: string;
  };
  concepto?: {
    id: number;
    nombre: string;
    esInscripcion: boolean;
  };
  tipoDeuda?: string;
  cantidadClases?: number;
  estiloNombre?: string;
  conceptoNombre?: string;
  pagos: {
    id: number;
    monto: number;
    fecha: string;
    recibo: {
      id: number;
      numeroRecibo: number;
      fecha: string;
      monto: number;
    };
  }[];
}

interface Recibo {
  id: number;
  numeroRecibo: number;
  fecha: string;
  periodoPago: string;
  alumno?: { nombre: string; apellido: string };
  alumnoSuelto?: { nombre: string; apellido: string };
  concepto: { nombre: string };
  monto: number;
  montoOriginal: number;
  descuento?: number;
  tipoPago: string;
  pagosDeuda?: {
    monto: number;
    deuda: {
      estilo: {
        nombre: string;
      };
    };
  }[];
}

interface Estadisticas {
  totalPagado: number;
  deudaTotal: number;
  cantidadDeudas: number;
  estilosActivos: number;
  ultimoPago: string | null;
  descuentosActivos: {
    tipo: string;
    porcentaje: number;
  }[];
}

interface EstadoPagos {
  alDia: boolean;
  mesesAdeudados: string[];
}

// Styled Components
const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: 0;
  }
`;

const Container = styled.div`
  background-color: #FFFFFF;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  
  @media (max-width: 768px) {
    padding: 20px 15px;
    border-radius: 0;
    box-shadow: none;
  }
`;

const Title = styled.h2`
  color: #1A202C;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 2px solid #FFC001;
  font-size: 1.8rem;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 20px;
    padding-bottom: 10px;
  }
`;

const SearchSection = styled.div`
  position: relative;
  margin-bottom: 25px;
`;

const SearchIcon = styled.span`
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #718096;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 14px 14px 14px 45px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  
  &:focus {
    border-color: #FFC001;
    outline: none;
    box-shadow: 0 0 0 3px rgba(255, 192, 1, 0.2);
  }
  
  @media (max-width: 768px) {
    padding: 12px 12px 12px 40px;
    font-size: 0.95rem;
  }
`;

const AlumnoList = styled(motion.ul)`
  list-style-type: none;
  padding: 0;
  margin-bottom: 25px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  max-height: 300px;
  overflow-y: auto;
  background-color: white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  z-index: 10;
  position: relative;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #CBD5E0;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #A0AEC0;
  }
  
  @media (max-width: 768px) {
    border-radius: 6px;
  }
`;

const AlumnoItem = styled(motion.li)`
  padding: 14px 18px;
  border-bottom: 1px solid #E2E8F0;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: #F7FAFC;
  }
  
  @media (max-width: 768px) {
    padding: 12px 15px;
  }
`;

const AlumnoName = styled.span`
  font-weight: 500;
  color: #2D3748;
`;

const AlumnoCard = styled.div`
  background-color: #F7FAFC;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
`;

const AlumnoInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const AlumnoActions = styled.div`
  display: flex;
  gap: 10px;
  
  @media (max-width: 768px) {
    align-self: flex-end;
  }
`;

const AlumnoNombre = styled.h2`
  margin: 0 0 5px 0;
  font-size: 1.5rem;
  color: #1A202C;
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 15px;
  }
`;

const DashboardCard = styled(motion.div)<{ status?: 'success' | 'warning' | 'danger' }>`
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border-left: 4px solid ${props => {
    switch (props.status) {
      case 'success': return '#4CAF50';
      case 'warning': return '#FFC107';
      case 'danger': return '#f44336';
      default: return '#FFC001';
    }
  }};
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  }
`;

const CardTitle = styled.h4`
  margin: 0 0 10px 0;
  color: #718096;
  font-size: 0.9rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const CardValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1A202C;
  margin-bottom: 5px;
`;

const CardSubValue = styled.div`
  font-size: 0.9rem;
  color: #718096;
  margin-top: 8px;
`;

const TabsContainer = styled.div`
  display: flex;
  margin-bottom: 30px;
  border-bottom: 2px solid #E2E8F0;
  overflow-x: auto;
  scrollbar-width: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
  
  @media (max-width: 768px) {
    padding-bottom: 2px;
  }
`;

const TabButton = styled.button<{ active: boolean }>`
  padding: 12px 20px;
  border: none;
  background: none;
  color: ${props => props.active ? '#1A202C' : '#718096'};
  font-weight: ${props => props.active ? '600' : '500'};
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
  font-size: 1rem;
  white-space: nowrap;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: ${props => props.active ? '#FFC001' : 'transparent'};
    transition: all 0.3s ease;
  }
  
  &:hover {
    color: ${props => props.active ? '#1A202C' : '#4A5568'};
    
    &::after {
      background-color: ${props => props.active ? '#FFC001' : '#E2E8F0'};
    }
  }
  
  @media (max-width: 768px) {
    padding: 10px 15px;
    font-size: 0.9rem;
  }
`;

const TabContent = styled(motion.div)`
  min-height: 200px;
`;

const TableContainer = styled.div`
  overflow-x: auto;
  margin-bottom: 30px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    height: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #CBD5E0;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #A0AEC0;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background-color: white;
  overflow: hidden;
`;

const Th = styled.th`
  background-color: #1A202C;
  color: #FFFFFF;
  text-align: left;
  padding: 15px;
  font-weight: 500;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: sticky;
  top: 0;
  z-index: 10;
  
  &:first-child {
    border-top-left-radius: 10px;
  }
  
  &:last-child {
    border-top-right-radius: 10px;
  }
  
  @media (max-width: 768px) {
    padding: 12px 10px;
    font-size: 0.8rem;
  }
`;

const Td = styled.td`
  border-bottom: 1px solid #E2E8F0;
  padding: 14px 15px;
  color: #4A5568;
  font-size: 0.95rem;
  vertical-align: middle;
  
  @media (max-width: 768px) {
    padding: 12px 10px;
    font-size: 0.85rem;
  }
`;

const Tr = styled.tr`
  transition: background-color 0.2s ease;
  
  &:nth-child(even) {
    background-color: #F7FAFC;
  }
  
  &:hover {
    background-color: #EDF2F7;
  }
  
  &:last-child td:first-child {
    border-bottom-left-radius: 10px;
  }
  
  &:last-child td:last-child {
    border-bottom-right-radius: 10px;
  }
`;

const TotalContainer = styled.div`
  margin-top: 20px;
  padding: 20px;
  background-color: #F7FAFC;
  border-radius: 10px;
  text-align: right;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1A202C;
  display: flex;
  justify-content: space-between;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
`;

const SectionTitle = styled.h3`
  color: #2D3748;
  margin: 30px 0 20px 0;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 10px;
  
  span {
    background-color: #EDF2F7;
    color: #4A5568;
    padding: 3px 10px;
    border-radius: 15px;
    font-size: 0.9rem;
    font-weight: 500;
  }
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

interface StatusProps {
  status: 'success' | 'warning' | 'danger';
}

const InscripcionCard = styled(motion.div)<StatusProps>`
  grid-column: 1 / -1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  background: ${props => props.status === 'success' ? '#F0FFF4' : '#FFFBEB'};
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border-left: 4px solid ${props => props.status === 'success' ? '#48BB78' : '#F6AD55'};
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
`;

const InscripcionInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const InscripcionEstado = styled.div<StatusProps>`
  font-size: 1.2em;
  font-weight: 600;
  color: ${props => props.status === 'success' ? '#276749' : '#C05621'};
`;

const InscripcionFecha = styled.div`
  font-size: 0.95em;
  color: #4A5568;
`;

const StatusBadge = styled.span<{ status: 'success' | 'warning' | 'danger' }>`
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background-color: ${props => {
    switch (props.status) {
      case 'success': return '#F0FFF4';
      case 'warning': return '#FFFBEB';
      case 'danger': return '#FFF5F5';
      default: return '#f5f5f5';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'success': return '#276749';
      case 'warning': return '#C05621';
      case 'danger': return '#C53030';
      default: return '#666';
    }
  }};
  
  &::before {
    content: "";
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${props => {
      switch (props.status) {
        case 'success': return '#48BB78';
        case 'warning': return '#F6AD55';
        case 'danger': return '#FC8181';
        default: return '#CBD5E0';
      }
    }};
  }
`;

const ActionButton = styled.button<{ variant?: 'danger' | 'primary' | 'secondary' }>`
  background-color: ${props => {
    switch(props.variant) {
      case 'danger': return '#FFF5F5';
      case 'primary': return '#FFC001';
      case 'secondary': return '#EDF2F7';
      default: return '#EDF2F7';
    }
  }};
  color: ${props => {
    switch(props.variant) {
      case 'danger': return '#C53030';
      case 'primary': return '#1A202C';
      case 'secondary': return '#4A5568';
      default: return '#4A5568';
    }
  }};
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  font-size: 0.85rem;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  
  &:hover {
    background-color: ${props => {
      switch(props.variant) {
        case 'danger': return '#FED7D7';
        case 'primary': return '#E6AC00';
        case 'secondary': return '#E2E8F0';
        default: return '#E2E8F0';
      }
    }};
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
  
  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 0.8rem;
  }
`;

const PagoInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  
  div {
    font-size: 0.9rem;
  }
  
  small {
    color: #718096;
    font-size: 0.8rem;
  }
`;

const NoDataMessage = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #718096;
  font-size: 1rem;
  background-color: #F7FAFC;
  border-radius: 10px;
  margin: 20px 0;
  
  svg {
    margin-bottom: 15px;
    color: #A0AEC0;
    width: 40px;
    height: 40px;
  }
`;

const LoadingIndicator = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #E2E8F0;
    border-top: 3px solid #FFC001;
    border-radius: 50%;
    margin-bottom: 15px;
  }
`;

const ConfirmationModal = styled(motion.div)`
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
  padding: 20px;
`;

const ModalContent = styled(motion.div)`
  background-color: white;
  padding: 30px;
  border-radius: 10px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  
  h3 {
    margin-top: 0;
    color: #1A202C;
  }
  
  p {
    color: #4A5568;
    margin-bottom: 25px;
  }
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const CtaCte: React.FC = () => {
  // Estados
  const [searchTerm, setSearchTerm] = useState('');
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [selectedAlumno, setSelectedAlumno] = useState<Alumno | null>(null);
  const [recibos, setRecibos] = useState<Recibo[]>([]);
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [estadoPagos, setEstadoPagos] = useState<EstadoPagos | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'recibos' | 'deudas'>('dashboard');
  const [loading, setLoading] = useState(false);
  const [deudaAEliminar, setDeudaAEliminar] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [deudaSeleccionada, setDeudaSeleccionada] = useState<Deuda | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchTerm.length > 2) {
      fetchAlumnos();
    } else {
      setAlumnos([]);
    }
  }, [searchTerm]);

  useEffect(() => {
    // Auto-focus search input on page load
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const fetchAlumnos = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/ctacte?query=${searchTerm}`);
      if (res.ok) {
        const data = await res.json();
        setAlumnos(data.map((a: any) => ({
          ...a,
          esAlumnoSuelto: 'alumnoRegularId' in a
        })));
      }
    } catch (error) {
      console.error('Error fetching alumnos:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  const fetchAlumnoInfo = async (alumnoId: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/ctacte?alumnoId=${alumnoId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedAlumno(data.alumnoInfo);
        setRecibos(data.recibos);
        setEstadisticas(data.estadisticas);
        setEstadoPagos(data.estadoPagos);
      }
    } catch (error) {
      console.error('Error fetching alumno info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAlumnoSelect = (alumno: Alumno) => {
    fetchAlumnoInfo(alumno.id);
    setSearchTerm('');
    setAlumnos([]);
    setActiveTab('dashboard');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const formatFecha = (fecha: string) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const confirmEliminarDeuda = (deuda: Deuda) => {
    setDeudaSeleccionada(deuda);
    setShowModal(true);
  };

  const handleEliminarDeuda = async () => {
    if (!deudaSeleccionada) return;
    
    try {
      setLoading(true);
      const res = await fetch(`/api/deudas/${deudaSeleccionada.id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        // Actualizar la lista de deudas después de eliminar
        fetchAlumnoInfo(selectedAlumno!.id);
        setShowModal(false);
        setDeudaSeleccionada(null);
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Error al eliminar la deuda');
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al eliminar la deuda');
    } finally {
      setLoading(false);
    }
  };

  const renderDashboard = () => {
    if (!estadisticas || !estadoPagos) return null;
    return (
      <>
        {selectedAlumno?.deudas && (
          <InscripcionCard 
            status={selectedAlumno.deudas.find(d => d.concepto?.esInscripcion)?.pagada ? 'success' : 'warning'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <InscripcionInfo>
              <InscripcionEstado status={
                selectedAlumno.deudas.find(d => d.concepto?.esInscripcion)?.pagada ? 'success' : 'warning'
              }>
                Inscripción: {selectedAlumno.deudas.find(d => d.concepto?.esInscripcion)?.pagada ? 'Pagada' : 'Pendiente'}
              </InscripcionEstado>
              {selectedAlumno.deudas.find(d => d.concepto?.esInscripcion)?.pagada ? (
                <InscripcionFecha>
                  Fecha de pago: {formatFecha(
                    selectedAlumno.deudas.find(d => d.concepto?.esInscripcion)?.fechaPago || ''
                  )}
                </InscripcionFecha>
              ) : (
                <InscripcionFecha>
                  Vencimiento: {formatFecha(
                    selectedAlumno.deudas.find(d => d.concepto?.esInscripcion)?.fechaVencimiento || ''
                  )}
                </InscripcionFecha>
              )}
            </InscripcionInfo>
            
            {!selectedAlumno.deudas.find(d => d.concepto?.esInscripcion)?.pagada && (
              <ActionButton variant="primary">
                Registrar Pago
              </ActionButton>
            )}
          </InscripcionCard>
        )}
        <DashboardGrid>
          <DashboardCard 
            status={estadoPagos.alDia ? 'success' : 'danger'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <CardTitle>Estado de Cuenta</CardTitle>
            <CardValue>
              {estadoPagos.alDia ? 'Al día' : 'Con deudas'}
            </CardValue>
            {!estadoPagos.alDia && (
              <CardSubValue>
                {estadoPagos.mesesAdeudados.length} {estadoPagos.mesesAdeudados.length === 1 ? 'mes' : 'meses'} pendientes
              </CardSubValue>
            )}
          </DashboardCard>

          <DashboardCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <CardTitle>Total Pagado</CardTitle>
            <CardValue>{formatCurrency(estadisticas.totalPagado)}</CardValue>
            {estadisticas.ultimoPago && (
              <CardSubValue>
                Último pago: {formatFecha(estadisticas.ultimoPago)}
              </CardSubValue>
            )}
          </DashboardCard>
          <DashboardCard 
            status={estadisticas.deudaTotal > 0 ? 'warning' : 'success'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <CardTitle>Deuda Total</CardTitle>
            <CardValue>{formatCurrency(estadisticas.deudaTotal)}</CardValue>
            <CardSubValue>
              {estadisticas.cantidadDeudas} cuota{estadisticas.cantidadDeudas !== 1 ? 's' : ''} pendiente{estadisticas.cantidadDeudas !== 1 ? 's' : ''}
            </CardSubValue>
          </DashboardCard>

          <DashboardCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <CardTitle>Estilos Activos</CardTitle>
            <CardValue>{estadisticas.estilosActivos}</CardValue>
            {estadisticas.descuentosActivos.length > 0 && (
              <CardSubValue>
                {estadisticas.descuentosActivos.map((desc, i) => (
                  <div key={i}>
                    {desc.tipo}: {desc.porcentaje}% descuento
                  </div>
                ))}
              </CardSubValue>
            )}
          </DashboardCard>
        </DashboardGrid>
      </>
    );
  };

  const renderRecibosTable = () => {
    if (recibos.length === 0) {
      return (
        <NoDataMessage>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <div>No hay recibos registrados para este alumno</div>
        </NoDataMessage>
      );
    }
    
    return (
      <>
        <TableContainer>
          <Table>
            <thead>
              <tr>
                <Th>N° Recibo</Th>
                <Th>Fecha</Th>
                <Th>Periodo</Th>
                <Th>Concepto</Th>
                <Th>Deudas Pagadas</Th>
                <Th>Monto Original</Th>
                <Th>Descuento</Th>
                <Th>Monto Final</Th>
                <Th>Forma de Pago</Th>
              </tr>
            </thead>
            <tbody>
              {recibos.map((recibo) => (
                <Tr key={recibo.id}>
                  <Td>{recibo.numeroRecibo}</Td>
                  <Td>{formatFecha(recibo.fecha)}</Td>
                  <Td>{recibo.periodoPago}</Td>
                  <Td>{recibo.concepto.nombre}</Td>
                  <Td>
                    {recibo.pagosDeuda?.map((pago, index) => (
                      <div key={index}>
                        {pago.deuda.estilo?.nombre || "Inscripción"}: {formatCurrency(pago.monto)}
                      </div>
                    ))}
                  </Td>
                  <Td>{formatCurrency(recibo.montoOriginal)}</Td>
                  <Td>
                    {recibo.descuento 
                      ? `${(recibo.descuento * 100).toFixed(0)}%` 
                      : '-'}
                  </Td>
                  <Td>{formatCurrency(recibo.monto)}</Td>
                  <Td>{recibo.tipoPago}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </TableContainer>
        <TotalContainer>
          <span>Total Pagado:</span>
          <span>{formatCurrency(estadisticas?.totalPagado || 0)}</span>
        </TotalContainer>
      </>
    );
  };

  const renderDeudasTable = () => {
    if (!selectedAlumno?.deudas) return null;
  
    const ordenarDeudas = (deudas: Deuda[]) => {
      return deudas.sort((a, b) => {
        if (a.anio !== b.anio) return a.anio - b.anio;
        return parseInt(a.mes) - parseInt(b.mes);
      });
    };
  
    const deudasPendientes = ordenarDeudas(selectedAlumno.deudas.filter(d => !d.pagada));
    const deudasPagadas = ordenarDeudas(selectedAlumno.deudas.filter(d => d.pagada));
  
    // Función para mostrar el nombre del estilo o un valor alternativo
    const getNombreEstilo = (deuda: Deuda) => {
      if (deuda.estilo) return deuda.estilo.nombre;
      if (deuda.estiloNombre) return deuda.estiloNombre;
      if (deuda.concepto?.esInscripcion) return "Inscripción";
      return deuda.tipoDeuda === "SUELTA" ? "Clase suelta" : "Sin estilo";
    };
  
    return (
      <>
        <SectionTitle>Deudas Pendientes <span>{deudasPendientes.length}</span></SectionTitle>
        
        {deudasPendientes.length === 0 ? (
          <NoDataMessage>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>No hay deudas pendientes</div>
          </NoDataMessage>
        ) : (
          <TableContainer>
            <Table>
              <thead>
                <tr>
                  <Th>Estilo</Th>
                  <Th>Período</Th>
                  <Th>Concepto</Th>
                  <Th>Monto</Th>
                  <Th>Vencimiento</Th>
                  <Th>Estado</Th>
                  <Th>Acciones</Th>
                </tr>
              </thead>
              <tbody>
                {deudasPendientes.map((deuda) => (
                  <Tr key={deuda.id}>
                    <Td>{getNombreEstilo(deuda)}</Td>
                    <Td>{`${deuda.mes}/${deuda.anio}`}</Td>
                    <Td>{deuda.concepto?.nombre || deuda.conceptoNombre || "-"}</Td>
                    <Td>{formatCurrency(deuda.monto)}</Td>
                    <Td>{formatFecha(deuda.fechaVencimiento)}</Td>
                    <Td>
                      <StatusBadge status="danger">
                        Pendiente
                      </StatusBadge>
                    </Td>
                    <Td>
                      <ActionButton 
                        variant="danger"
                        onClick={() => confirmEliminarDeuda(deuda)}
                        disabled={loading}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Eliminar
                      </ActionButton>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </TableContainer>
        )}
        
        <SectionTitle style={{ marginTop: '30px' }}>Deudas Pagadas <span>{deudasPagadas.length}</span></SectionTitle>
        
        {deudasPagadas.length === 0 ? (
          <NoDataMessage>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div>No hay deudas pagadas</div>
          </NoDataMessage>
        ) : (
          <TableContainer>
            <Table>
              <thead>
                <tr>
                  <Th>Estilo</Th>
                  <Th>Período</Th>
                  <Th>Concepto</Th>
                  <Th>Monto Original</Th>
                  <Th>Pagos</Th>
                  <Th>Fecha Pago</Th>
                  <Th>Estado</Th>
                  <Th>Acciones</Th>
                </tr>
              </thead>
              <tbody>
                {deudasPagadas.map((deuda) => (
                  <Tr key={deuda.id}>
                    <Td>{getNombreEstilo(deuda)}</Td>
                    <Td>{`${deuda.mes}/${deuda.anio}`}</Td>
                    <Td>{deuda.concepto?.nombre || deuda.conceptoNombre || "-"}</Td>
                    <Td>{formatCurrency(deuda.montoOriginal || deuda.monto)}</Td>
                    <Td>
                      {deuda.pagos.map((pago, index) => (
                        <PagoInfo key={index}>
                          <div>Recibo #{pago.recibo.numeroRecibo}</div>
                          <div>{formatCurrency(pago.monto)}</div>
                          <small>{formatFecha(pago.recibo.fecha)}</small>
                        </PagoInfo>
                      ))}
                    </Td>
                    <Td>{deuda.fechaPago ? formatFecha(deuda.fechaPago) : '-'}</Td>
                    <Td>
                      <StatusBadge status="success">
                        Pagada
                      </StatusBadge>
                    </Td>
                    <Td>
                      <ActionButton 
                        variant="danger"
                        onClick={() => confirmEliminarDeuda(deuda)}
                        disabled={loading}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Eliminar
                      </ActionButton>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </TableContainer>
        )}
      </>
    );
  };

  return (
    <PageContainer>
      <Container>
        <Title>Cuenta Corriente</Title>
        
        <SearchSection>
          <SearchIcon>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </SearchIcon>
          <SearchInput
            ref={searchInputRef}
            type="text"
            placeholder="Buscar alumno por nombre o apellido..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchSection>

        <AnimatePresence>
          {alumnos.length > 0 && (
            <AlumnoList
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {alumnos.map((alumno) => (
                <AlumnoItem 
                  key={alumno.id} 
                  onClick={() => handleAlumnoSelect(alumno)}
                  whileHover={{ backgroundColor: '#F7FAFC' }}
                  whileTap={{ scale: 0.98 }}
                >
                  <AlumnoName>
                    {alumno.nombre} {alumno.apellido}
                  </AlumnoName>
                  {alumno.esAlumnoSuelto && 
                    <StatusBadge status="warning">
                      Suelto
                    </StatusBadge>
                  }
                </AlumnoItem>
              ))}
            </AlumnoList>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {loading && !selectedAlumno && (
            <LoadingIndicator
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="spinner"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <div>Buscando alumnos...</div>
            </LoadingIndicator>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {selectedAlumno && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <AlumnoCard>
                <AlumnoInfo>
                  <AlumnoNombre>
                    {selectedAlumno.nombre} {selectedAlumno.apellido}
                  </AlumnoNombre>
                  {estadoPagos && (
                    <StatusBadge 
                      status={estadoPagos.alDia ? 'success' : 'danger'}
                    >
                      {estadoPagos.alDia ? 'Al día' : 'Con deudas pendientes'}
                    </StatusBadge>
                  )}
                </AlumnoInfo>

                <AlumnoActions>
                  <ActionButton 
                    variant="secondary"
                    onClick={() => {
                      setSelectedAlumno(null);
                      setRecibos([]);
                      setEstadisticas(null);
                      setEstadoPagos(null);
                      setSearchTerm('');
                      if (searchInputRef.current) {
                        searchInputRef.current.focus();
                      }
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Volver
                  </ActionButton>

                  <ActionButton 
                    variant="primary"
                    onClick={() => window.location.href = `/recibos?alumnoId=${selectedAlumno.id}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Nuevo Pago
                  </ActionButton>
                </AlumnoActions>
              </AlumnoCard>

              <TabsContainer>
                <TabButton 
                  active={activeTab === 'dashboard'}
                  onClick={() => setActiveTab('dashboard')}
                >
                  Dashboard
                </TabButton>
                <TabButton 
                  active={activeTab === 'recibos'}
                  onClick={() => setActiveTab('recibos')}
                >
                  Recibos
                </TabButton>
                <TabButton 
                  active={activeTab === 'deudas'}
                  onClick={() => setActiveTab('deudas')}
                >
                  Deudas
                </TabButton>
              </TabsContainer>

              <AnimatePresence mode="wait">
                {activeTab === 'dashboard' && (
                  <TabContent
                    key="dashboard"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {renderDashboard()}
                  </TabContent>
                )}
                
                {activeTab === 'recibos' && (
                  <TabContent
                    key="recibos"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {renderRecibosTable()}
                  </TabContent>
                )}
                
                {activeTab === 'deudas' && (
                  <TabContent
                    key="deudas"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {renderDeudasTable()}
                  </TabContent>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {loading && selectedAlumno && (
            <LoadingIndicator
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
            >
              <motion.div
                className="spinner"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <div>Cargando información...</div>
            </LoadingIndicator>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showModal && (
            <ConfirmationModal
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ModalContent
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <h3>Confirmar eliminación</h3>
                <p>
                  ¿Estás seguro que deseas eliminar esta deuda? 
                  {deudaSeleccionada?.pagada ? 
                    ' Esta deuda ya ha sido pagada y eliminarla podría causar inconsistencias en el sistema.' : 
                    ' Esta acción no se puede deshacer.'}
                </p>
                <ModalActions>
                  <ActionButton 
                    variant="secondary" 
                    onClick={() => {
                      setShowModal(false);
                      setDeudaSeleccionada(null);
                    }}
                  >
                    Cancelar
                  </ActionButton>
                  <ActionButton 
                    variant="danger" 
                    onClick={handleEliminarDeuda}
                    disabled={loading}
                  >
                    {loading ? 'Eliminando...' : 'Eliminar'}
                  </ActionButton>
                </ModalActions>
              </ModalContent>
            </ConfirmationModal>
          )}
        </AnimatePresence>
      </Container>
    </PageContainer>
  );
};

export default CtaCte;