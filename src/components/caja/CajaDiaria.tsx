import React, { useEffect, useState, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserRole } from '@/hooks/useUserRole';
import { getArgentinaDateTime } from '@/utils/dateUtils';

// Styled Components con mejoras de diseño y responsividad
const Container = styled.div`
  background-color: #FFFFFF;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  
  @media (max-width: 768px) {
    padding: 20px 15px;
    border-radius: 8px;
  }
`;

const Title = styled.h2`
  color: #1A202C;
  margin-bottom: 25px;
  font-size: 1.8rem;
  font-weight: 700;
  padding-bottom: 12px;
  border-bottom: 2px solid #FFC001;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 20px;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 25px;
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    gap: 20px;
  }
`;

const FormRow = styled.div`
  display: flex;
  gap: 20px;
  align-items: flex-start;
  
  @media (max-width: 1024px) {
    flex-wrap: wrap;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 200px;
  
  @media (max-width: 768px) {
    width: 100%;
    min-width: unset;
  }
`;

const Label = styled.label`
  font-weight: 600;
  color: #4A5568;
  font-size: 0.9rem;
`;

const Input = styled.input`
  padding: 12px 15px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 1rem;
  width: 100%;
  transition: all 0.2s ease;
  background-color: #FFFFFF;
  
  &:focus {
    outline: none;
    border-color: #FFC001;
    box-shadow: 0 0 0 3px rgba(255, 192, 1, 0.2);
  }
  
  &:disabled {
    background-color: #F7FAFC;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    padding: 10px 12px;
  }
`;

const Select = styled.select`
  padding: 12px 15px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 1rem;
  width: 100%;
  transition: all 0.2s ease;
  background-color: #FFFFFF;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 15px center;
  background-size: 15px;
  
  &:focus {
    outline: none;
    border-color: #FFC001;
    box-shadow: 0 0 0 3px rgba(255, 192, 1, 0.2);
  }
  
  @media (max-width: 768px) {
    padding: 10px 12px;
  }
`;

const Button = styled(motion.button)`
  background-color: #FFC001;
  color: #1A202C;
  border: none;
  padding: 14px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  align-self: flex-end;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background-color: #F0B000;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    background-color: #CBD5E0;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    padding: 12px;
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    height: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #F7FAFC;
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
  overflow: hidden;
`;

const Th = styled.th`
  background-color: #1A202C;
  color: #FFFFFF;
  text-align: left;
  padding: 16px;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  position: sticky;
  top: 0;
  white-space: nowrap;
  
  &:first-child {
    border-top-left-radius: 8px;
  }
  
  &:last-child {
    border-top-right-radius: 8px;
  }
  
  @media (max-width: 768px) {
    padding: 12px 10px;
    font-size: 0.8rem;
  }
`;

const Td = styled.td`
  border-bottom: 1px solid #E2E8F0;
  padding: 14px 16px;
  font-size: 0.95rem;
  color: #4A5568;
  vertical-align: middle;
  
  @media (max-width: 768px) {
    padding: 12px 10px;
    font-size: 0.85rem;
  }
`;

const Tr = styled(motion.tr)`
  transition: background-color 0.2s ease;
  
  &:nth-child(even) {
    background-color: #F7FAFC;
  }
  
  &:hover {
    background-color: #EDF2F7;
  }
  
  &:last-child td:first-child {
    border-bottom-left-radius: 8px;
  }
  
  &:last-child td:last-child {
    border-bottom-right-radius: 8px;
  }
`;

const Message = styled(motion.div)<{ isError?: boolean }>`
  margin: 20px 0;
  padding: 16px;
  border-radius: 8px;
  background-color: ${props => props.isError ? '#FFF5F5' : '#F0FFF4'};
  color: ${props => props.isError ? '#C53030' : '#276749'};
  border-left: 4px solid ${props => props.isError ? '#FC8181' : '#68D391'};
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 12px;
  
  svg {
    width: 24px;
    height: 24px;
    color: ${props => props.isError ? '#E53E3E' : '#38A169'};
    flex-shrink: 0;
  }
  
  @media (max-width: 768px) {
    padding: 12px;
    font-size: 0.9rem;
  }
`;

const TotalesContainer = styled(motion.div)`
  background-color: #FAFAFA;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  
  @media (max-width: 768px) {
    padding: 20px 15px;
  }
`;

const TotalGeneral = styled.div`
  font-size: 1.5rem;
  color: #1A202C;
  margin-bottom: 25px;
  text-align: right;
  font-weight: 700;
  
  span {
    font-size: 0.85rem;
    color: #718096;
    font-weight: 400;
    display: block;
    margin-top: 5px;
  }
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
`;

const TotalesPorTipo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 10px;
  }
`;

const TotalTipo = styled(motion.div)`
  background-color: #FFFFFF;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  @media (max-width: 768px) {
    padding: 12px;
  }
`;

const TipoLabel = styled.p`
  font-weight: 600;
  margin-bottom: 8px;
  color: #4A5568;
  font-size: 0.9rem;
`;

const TipoMonto = styled.p`
  font-size: 1.3rem;
  color: #3182CE;
  font-weight: 700;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const AutocompleteContainer = styled.div`
  position: relative;
  width: 100%;
`;

const SearchInput = styled(Input)`
  padding-left: 40px;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #A0AEC0;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const SuggestionsList = styled(motion.ul)`
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  right: 0;
  max-height: 200px;
  overflow-y: auto;
  margin: 0;
  padding: 0;
  list-style: none;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #F7FAFC;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #CBD5E0;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #A0AEC0;
  }
`;

const SuggestionItem = styled(motion.li)`
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #EDF2F7;
  transition: background-color 0.2s ease;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: #F7FAFC;
  }
`;

const FilterBadge = styled.div`
  display: inline-flex;
  align-items: center;
  background-color: #F0FFF4;
  color: #276749;
  font-size: 0.85rem;
  padding: 4px 12px;
  border-radius: 20px;
  gap: 6px;
  margin-right: 10px;
  margin-bottom: 10px;
  
  button {
    background: none;
    border: none;
    color: #276749;
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 0;
    
    &:hover {
      color: #C53030;
    }
    
    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

const ActiveFilters = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 20px;
`;

const NoData = styled.div`
  text-align: center;
  padding: 50px 20px;
  color: #718096;
  
  svg {
    width: 60px;
    height: 60px;
    color: #CBD5E0;
    margin-bottom: 15px;
  }
  
  h3 {
    font-size: 1.2rem;
    margin-bottom: 10px;
    color: #4A5568;
  }
  
  p {
    font-size: 0.95rem;
  }
`;

const ReciboMonto = styled.span<{ anulado: boolean }>`
  font-weight: ${props => props.anulado ? 'normal' : '600'};
  color: ${props => props.anulado ? '#A0AEC0' : '#4A5568'};
  text-decoration: ${props => props.anulado ? 'line-through' : 'none'};
`;

const ReciboEstado = styled.span<{ anulado: boolean }>`
  display: inline-block;
  padding: 3px 8px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background-color: ${props => props.anulado ? '#FFF5F5' : '#F0FFF4'};
  color: ${props => props.anulado ? '#C53030' : '#276749'};
  margin-left: 10px;
`;

const LoadingSpinner = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 50px 0;
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #E2E8F0;
    border-top: 3px solid #FFC001;
    border-radius: 50%;
    margin-bottom: 15px;
  }
  
  p {
    color: #718096;
    font-size: 0.95rem;
  }
`;

interface Recibo {
  anulado: boolean;
  id: number;
  numeroRecibo: number;
  fecha: string;
  alumno?: { id: number; nombre: string; apellido: string };
  alumnoSuelto?: { id: number; nombre: string; apellido: string };
  concepto: { id: number; nombre: string };
  periodoPago: string;
  fueraDeTermino: boolean;
  monto: number;
  tipoPago: string;
}

interface CajaDiariaData {
  recibos: Recibo[];
  totalMonto: number;
  totalPorTipoPago: Record<string, number>;
}

const CajaDiaria = () => {
  // Función para obtener la fecha actual en formato YYYY-MM-DD
  const getTodayDate = () => {
    const today = getArgentinaDateTime();
    return today.toISOString().split('T')[0];
  };

  const [cajaData, setCajaData] = useState<CajaDiariaData>({ 
    recibos: [], 
    totalMonto: 0, 
    totalPorTipoPago: {} 
  });
  
  // Inicializar fechas con el día actual
  const [fechaInicio, setFechaInicio] = useState(getTodayDate());
  const [fechaFin, setFechaFin] = useState(getTodayDate());
  const [filtros, setFiltros] = useState({
    numeroRecibo: '',
    alumnoId: '',
    conceptoId: '',
    periodoPago: '',
    fueraDeTermino: '',
    tipoPago: ''
  });
  
  const [filtrosActivos, setFiltrosActivos] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [alumnos, setAlumnos] = useState<{ id: number; nombre: string; apellido: string }[]>([]);
  const [conceptos, setConceptos] = useState<{ id: number; nombre: string }[]>([]);
  const [searchAlumno, setSearchAlumno] = useState('');
  const [searchConcepto, setSearchConcepto] = useState('');
  const [alumnosFiltrados, setAlumnosFiltrados] = useState<any[]>([]);
  const [conceptosFiltrados, setConceptosFiltrados] = useState<any[]>([]);
  const lastUpdate = useRef(new Date());
  
  const [initialLoad, setInitialLoad] = useState(true);

  const userRole = useUserRole();

  const fetchCajaDiaria = useCallback(async () => {
    if (userRole !== 'Dueño' && userRole !== 'Secretaria') return;
    
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();

      // Siempre usar la fecha actual para la secretaria
      if (userRole === 'Secretaria') {
        const today = getTodayDate();
        queryParams.append('fechaInicio', today);
        queryParams.append('fechaFin', today);
      } else {
        queryParams.append('fechaInicio', fechaInicio);
        queryParams.append('fechaFin', fechaFin);
      }

      // Agregar filtros solo si es Dueño
      if (userRole === 'Dueño') {
        Object.entries(filtros).forEach(([key, value]) => {
          if (value) {
            queryParams.append(key, value);
            
            if (key === 'alumnoId' && alumnos.length > 0) {
              const alumno = alumnos.find(a => a.id.toString() === value);
              if (alumno) {
                setFiltrosActivos(prev => ({
                  ...prev,
                  alumno: `${alumno.apellido} ${alumno.nombre}`
                }));
              }
            } else if (key === 'conceptoId' && conceptos.length > 0) {
              const concepto = conceptos.find(c => c.id.toString() === value);
              if (concepto) {
                setFiltrosActivos(prev => ({
                  ...prev,
                  concepto: concepto.nombre
                }));
              }
            } else if (key === 'periodoPago') {
              setFiltrosActivos(prev => ({
                ...prev,
                periodo: value
              }));
            } else if (key === 'tipoPago') {
              setFiltrosActivos(prev => ({
                ...prev,
                tipoPago: value.replace('_', ' ')
              }));
            } else if (key === 'fueraDeTermino') {
              setFiltrosActivos(prev => ({
                ...prev,
                termino: value === 'true' ? 'Fuera de término' : 'En término'
              }));
            } else if (key === 'numeroRecibo') {
              setFiltrosActivos(prev => ({
                ...prev,
                numeroRecibo: value
              }));
            }
          }
        });
      }

      const res = await fetch(`/api/cajadiaria?${queryParams}`);
      if (!res.ok) throw new Error('Error al obtener recibos');
      
      const data = await res.json();
      setCajaData(data);
      
      setMessage({ 
        text: userRole === 'Dueño' && fechaInicio !== getTodayDate() ? 
          "Este es el historial de caja en las fechas seleccionadas" : 
          "Esta es la caja del día corriente", 
        isError: false 
      });
      
      setInitialLoad(false);
    } catch (error) {
      console.error('Error fetching recibos:', error);
      setMessage({ text: 'Error al cargar recibos', isError: true });
      setInitialLoad(false);
    } finally {
      setLoading(false);
    }
  }, [fechaInicio, fechaFin, filtros, userRole, alumnos, conceptos]);

  // Cargar datos iniciales
  useEffect(() => {
    if (userRole === 'Dueño' || userRole === 'Secretaria') {
      fetchAlumnos();
      fetchConceptos();
      
      // Establecer fecha inicial
      const today = getTodayDate();
      setFechaInicio(today);
      setFechaFin(today);
    }
  }, [userRole]);

  // Efecto para verificar cambio de día
  useEffect(() => {
    if (userRole === 'Dueño' || userRole === 'Secretaria') {
      const checkDayChange = () => {
        const argentinaDate = getArgentinaDateTime();
        const currentDate = lastUpdate.current;
        
        if (argentinaDate.getDate() !== currentDate.getDate() ||
            argentinaDate.getMonth() !== currentDate.getMonth() ||
            argentinaDate.getFullYear() !== currentDate.getFullYear()) {
          const today = getTodayDate();
          setFechaInicio(today);
          setFechaFin(today);
          lastUpdate.current = argentinaDate;
        }
      };

      const dayCheckInterval = setInterval(checkDayChange, 300000); // 5 minutos
      
      return () => {
        clearInterval(dayCheckInterval);
      };
    }
  }, [userRole]);

 const fetchAlumnos = async () => {
   try {
     const res = await fetch('/api/alumnos');
     if (res.ok) {
       const data = await res.json();
       setAlumnos(data);
     }
   } catch (error) {
     console.error('Error fetching alumnos:', error);
   }
 };

 const fetchConceptos = async () => {
   try {
     const res = await fetch('/api/conceptos');
     if (res.ok) {
       const data = await res.json();
       setConceptos(data);
     }
   } catch (error) {
     console.error('Error fetching conceptos:', error);
   }
 };

 const renderAlumnoNombre = (recibo: Recibo) => {
   if (recibo.alumno) {
     return `${recibo.alumno.nombre} ${recibo.alumno.apellido}`;
   } else if (recibo.alumnoSuelto) {
     return `${recibo.alumnoSuelto.nombre} ${recibo.alumnoSuelto.apellido} (Suelto)`;
   }
   return 'Desconocido';
 };

 const handleFiltroChange = (name: string, value: string) => {
   if (userRole === 'Dueño') {
     setFiltros(prev => ({ ...prev, [name]: value }));
   }
 };

 const handleRemoveFiltro = (key: string) => {
   setFiltros(prev => ({ ...prev, [key]: '' }));
   setFiltrosActivos(prev => {
     const newFiltros = { ...prev };
     if (key === 'alumnoId') delete newFiltros.alumno;
     if (key === 'conceptoId') delete newFiltros.concepto;
     if (key === 'periodoPago') delete newFiltros.periodo;
     if (key === 'tipoPago') delete newFiltros.tipoPago;
     if (key === 'fueraDeTermino') delete newFiltros.termino;
     if (key === 'numeroRecibo') delete newFiltros.numeroRecibo;
     return newFiltros;
   });
   
   // Reset search inputs
   if (key === 'alumnoId') setSearchAlumno('');
   if (key === 'conceptoId') setSearchConcepto('');
 };

 const handleSubmit = (e: React.FormEvent) => {
   e.preventDefault();
   if (userRole === 'Dueño' || userRole === 'Secretaria') {
     fetchCajaDiaria();
   }
 };

 // Cargar datos iniciales
 useEffect(() => {
   if (userRole === 'Dueño' || userRole === 'Secretaria') {
     fetchCajaDiaria();
   }
 }, [userRole, fetchCajaDiaria]);

 useEffect(() => {
   if (searchAlumno) {
     const filtered = alumnos.filter(alumno => 
       `${alumno.apellido} ${alumno.nombre}`.toLowerCase().includes(searchAlumno.toLowerCase())
     );
     setAlumnosFiltrados(filtered);
   } else {
     setAlumnosFiltrados([]);
   }
 }, [searchAlumno, alumnos]);

 useEffect(() => {
   if (searchConcepto) {
     const filtered = conceptos.filter(concepto => 
       concepto.nombre.toLowerCase().includes(searchConcepto.toLowerCase())
     );
     setConceptosFiltrados(filtered);
   } else {
     setConceptosFiltrados([]);
   }
 }, [searchConcepto, conceptos]);

 const formatDate = (dateString: string) => {
   try {
     const date = new Date(dateString);
     return date.toLocaleDateString('es-AR', {
       day: '2-digit',
       month: '2-digit',
       year: 'numeric'
     });
   } catch (e) {
     return dateString;
   }
 };

 // Cuando se hace clic fuera de autocomplete
 useEffect(() => {
   const handleClickOutside = (event: MouseEvent) => {
     if (
       alumnosFiltrados.length > 0 || 
       conceptosFiltrados.length > 0
     ) {
       if (!(event.target as HTMLElement).closest('.autocomplete-container')) {
         setAlumnosFiltrados([]);
         setConceptosFiltrados([]);
       }
     }
   };

   document.addEventListener('mousedown', handleClickOutside);
   return () => {
     document.removeEventListener('mousedown', handleClickOutside);
   };
 }, [alumnosFiltrados.length, conceptosFiltrados.length]);

 if (userRole === 'Profesor') {
   return (
     <Container>
       <Message 
         isError={true}
         initial={{ opacity: 0, y: -20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.3 }}
       >
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
         </svg>
         No tienes acceso a la información de caja diaria.
       </Message>
     </Container>
   );
 }

 return (
   <Container>
     <Title>Caja Diaria</Title>
     
     <Form onSubmit={handleSubmit}>
       <FormRow>
         <InputGroup>
           <Label>Desde:</Label>
           <Input
             type="date"
             value={fechaInicio}
             onChange={(e) => setFechaInicio(e.target.value)}
             readOnly={userRole === 'Secretaria'}
             style={userRole === 'Secretaria' ? { backgroundColor: '#F7FAFC' } : {}}
           />
         </InputGroup>
         {userRole === 'Dueño' && (
           <>
             <InputGroup>
               <Label>Hasta:</Label>
               <Input
                 type="date"
                 value={fechaFin}
                 onChange={(e) => setFechaFin(e.target.value)}
               />
             </InputGroup>

             {/* Filtros adicionales solo para Dueño */}
             <InputGroup>
               <Label>N° Recibo:</Label>
               <Input
type="text"
name="numeroRecibo"
value={filtros.numeroRecibo}
onChange={(e) => handleFiltroChange(e.target.name, e.target.value)}
placeholder="Número de Recibo"
/>
</InputGroup>
</>
)}
</FormRow>

{userRole === 'Dueño' && (
<>
<FormRow>
<InputGroup>
<Label>Alumno:</Label>
<AutocompleteContainer className="autocomplete-container">
<SearchIcon>
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
</SearchIcon>
<SearchInput
  type="text"
  value={searchAlumno}
  onChange={(e) => {
    setSearchAlumno(e.target.value);
    if (!e.target.value) {
      handleFiltroChange('alumnoId', '');
    }
  }}
  placeholder="Buscar alumno..."
/>
<AnimatePresence>
  {searchAlumno && alumnosFiltrados.length > 0 && (
    <SuggestionsList
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      {alumnosFiltrados.map(alumno => (
        <SuggestionItem
          key={alumno.id}
          onClick={() => {
            handleFiltroChange('alumnoId', alumno.id.toString());
            setSearchAlumno(`${alumno.apellido} ${alumno.nombre}`);
            setAlumnosFiltrados([]);
          }}
          whileHover={{ backgroundColor: '#F7FAFC' }}
          transition={{ duration: 0.1 }}
        >
          {alumno.apellido} {alumno.nombre}
        </SuggestionItem>
      ))}
    </SuggestionsList>
  )}
</AnimatePresence>
</AutocompleteContainer>
</InputGroup>
<InputGroup>
<Label>Concepto:</Label>
<AutocompleteContainer className="autocomplete-container">
<SearchIcon>
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
</SearchIcon>
<SearchInput
  type="text"
  value={searchConcepto}
  onChange={(e) => {
    setSearchConcepto(e.target.value);
    if (!e.target.value) {
      handleFiltroChange('conceptoId', '');
    }
  }}
  placeholder="Buscar concepto..."
/>
<AnimatePresence>
  {searchConcepto && conceptosFiltrados.length > 0 && (
    <SuggestionsList
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      {conceptosFiltrados.map(concepto => (
        <SuggestionItem
          key={concepto.id}
          onClick={() => {
            handleFiltroChange('conceptoId', concepto.id.toString());
            setSearchConcepto(concepto.nombre);
            setConceptosFiltrados([]);
          }}
          whileHover={{ backgroundColor: '#F7FAFC' }}
          transition={{ duration: 0.1 }}
        >
          {concepto.nombre}
        </SuggestionItem>
      ))}
    </SuggestionsList>
  )}
</AnimatePresence>
</AutocompleteContainer>
</InputGroup>
</FormRow>

<FormRow>
<InputGroup>
<Label>Periodo:</Label>
<Input
type="month"
name="periodoPago"
value={filtros.periodoPago}
onChange={(e) => handleFiltroChange(e.target.name, e.target.value)}
/>
</InputGroup>

<InputGroup>
<Label>Término:</Label>
<Select
name="fueraDeTermino"
value={filtros.fueraDeTermino}
onChange={(e) => handleFiltroChange(e.target.name, e.target.value)}
>
<option value="">Todos</option>
<option value="true">Fuera de término</option>
<option value="false">En término</option>
</Select>
</InputGroup>

<InputGroup>
<Label>Tipo de Pago:</Label>
<Select
name="tipoPago"
value={filtros.tipoPago}
onChange={(e) => handleFiltroChange(e.target.name, e.target.value)}
>
<option value="">Todos</option>
<option value="EFECTIVO">Efectivo</option>
<option value="MERCADO_PAGO">Mercado Pago</option>
<option value="TRANSFERENCIA">Transferencia</option>
<option value="DEBITO_AUTOMATICO">Débito Automático</option>
<option value="OTRO">Otro</option>
</Select>
</InputGroup>
</FormRow>
</>
)}

<Button 
type="submit" 
disabled={loading}
whileTap={{ scale: 0.97 }}
>
{loading ? (
<>
<motion.div
animate={{ rotate: 360 }}
transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
style={{ width: 20, height: 20, borderRadius: '50%', borderTop: '2px solid #FFF', borderRight: '2px solid transparent', borderBottom: '2px solid #FFF', borderLeft: '2px solid #FFF' }}
/>
Cargando...
</>
) : (
<>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
<line x1="3" y1="9" x2="21" y2="9"></line>
<line x1="9" y1="21" x2="9" y2="9"></line>
</svg>
Mostrar caja
</>
)}
</Button>
</Form>

{Object.keys(filtrosActivos).length > 0 && (
<ActiveFilters>
{Object.entries(filtrosActivos).map(([key, value]) => (
<FilterBadge key={key}>
{key === 'alumno' ? 'Alumno: ' : 
key === 'concepto' ? 'Concepto: ' : 
key === 'periodo' ? 'Periodo: ' : 
key === 'tipoPago' ? 'Tipo Pago: ' : 
key === 'termino' ? 'Término: ' : 
key === 'numeroRecibo' ? 'Recibo #' : ''}
{value}
<button onClick={() => {
if (key === 'alumno') handleRemoveFiltro('alumnoId');
else if (key === 'concepto') handleRemoveFiltro('conceptoId');
else if (key === 'periodo') handleRemoveFiltro('periodoPago');
else if (key === 'tipoPago') handleRemoveFiltro('tipoPago');
else if (key === 'termino') handleRemoveFiltro('fueraDeTermino');
else if (key === 'numeroRecibo') handleRemoveFiltro('numeroRecibo');
}}>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
<path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
</svg>
</button>
</FilterBadge>
))}
</ActiveFilters>
)}

<AnimatePresence mode="wait">
{message && (
<Message 
isError={message.isError}
initial={{ opacity: 0, y: -20 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0 }}
transition={{ duration: 0.3 }}
>
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
{message.isError ? (
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
) : (
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
)}
</svg>
{message.text}
</Message>
)}

{loading && (
<LoadingSpinner
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}
transition={{ duration: 0.3 }}
>
<motion.div
className="spinner"
animate={{ rotate: 360 }}
transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
/>
<p>Cargando datos de la caja...</p>
</LoadingSpinner>
)}

{!loading && cajaData.recibos.length === 0 && !initialLoad && (
<NoData>
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
</svg>
<h3>No hay recibos para mostrar</h3>
<p>No se encontraron transacciones para los criterios seleccionados.</p>
</NoData>
)}

{!loading && cajaData.recibos.length > 0 && (
<motion.div
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.3 }}
>
<TableContainer>
<Table>
<thead>
<tr>
  <Th>N° Recibo</Th>
  <Th>Fecha</Th>
  <Th>Alumno</Th>
  <Th>Concepto</Th>
  <Th>Periodo</Th>
  <Th>Término</Th>
  <Th>Importe</Th>
  <Th>Tipo de Pago</Th>
  <Th>Estado</Th>
</tr>
</thead>
<tbody>
{cajaData.recibos.map((recibo, index) => (
  <Tr 
    key={recibo.id} 
    style={{
      backgroundColor: recibo.anulado ? '#FFF5F5' : undefined
    }}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.2, delay: index * 0.03 }}
  >
    <Td>{recibo.numeroRecibo}</Td>
    <Td>{formatDate(recibo.fecha)}</Td>
    <Td>{renderAlumnoNombre(recibo)}</Td>
    <Td>{recibo.concepto.nombre}</Td>
    <Td>{recibo.periodoPago}</Td>
    <Td>{recibo.fueraDeTermino ? 'Fuera de término' : 'En término'}</Td>
    <Td>
      <ReciboMonto anulado={recibo.anulado}>
        ${recibo.monto.toFixed(0)}
      </ReciboMonto>
    </Td>
    <Td>{recibo.tipoPago.replace('_', ' ')}</Td>
    <Td>
      <ReciboEstado anulado={recibo.anulado}>
        {recibo.anulado ? 'Anulado' : 'Activo'}
      </ReciboEstado>
    </Td>
  </Tr>
))}
</tbody>
</Table>
</TableContainer>

<TotalesContainer
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.3, delay: 0.2 }}
>
<TotalGeneral>
Total General: ${cajaData.totalMonto.toFixed(0)}
{cajaData.recibos.some(r => r.anulado) && (
<span>
  (No incluye recibos anulados)
</span>
)}
</TotalGeneral>
<TotalesPorTipo>
{Object.entries(cajaData.totalPorTipoPago).map(([tipo, total], index) => (
<TotalTipo 
  key={tipo}
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.2, delay: 0.3 + index * 0.05 }}
  whileHover={{ y: -2, boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)' }}
>
  <TipoLabel>{tipo.replace('_', ' ')}</TipoLabel>
  <TipoMonto>${total.toFixed(0)}</TipoMonto>
</TotalTipo>
))}
</TotalesPorTipo>
</TotalesContainer>
</motion.div>
)}
</AnimatePresence>
</Container>
);
};

export default CajaDiaria;