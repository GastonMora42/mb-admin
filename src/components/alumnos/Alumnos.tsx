import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Alumno, Estilo } from '@/types/alumnos-estilos';
import EstilosComponent from './EstilosXAlumnos';
import EditAlumnoModal from '@/pages/api/alumnos/EditAlumnoModal';

// Contenedor principal de la página
const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  
  @media (max-width: 768px) {
    padding: 10px;
  }
`;


// Contenedor con sombra
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

// Título principal
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

// Formulario de registro
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 25px;
  margin-bottom: 30px;
`;

// Grid para campos del formulario
const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 15px;
  }
`;

// Sección del formulario
const FormSection = styled.div`
  margin-bottom: 35px;
  padding-bottom: 25px;
  border-bottom: 1px solid #E2E8F0;
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
  
  @media (max-width: 768px) {
    margin-bottom: 25px;
    padding-bottom: 20px;
  }
`;

// Título de sección
const SectionTitle = styled.h3`
  font-size: 1.3rem;
  margin-bottom: 20px;
  color: #2D3748;
  font-weight: 600;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
    margin-bottom: 15px;
  }
`;

// Campo de formulario
const FormField = styled.div`
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    margin-bottom: 15px;
  }
`;

// Etiqueta para campos
const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #4A5568;
  font-size: 0.95rem;
`;

// Campo de entrada mejorado
const Input = styled.input`
  padding: 12px 15px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  width: 100%;
  font-size: 1rem;
  transition: all 0.2s ease;
  
  &:focus {
    border-color: #FFC001;
    outline: none;
    box-shadow: 0 0 0 3px rgba(255, 192, 1, 0.2);
  }
  
  &::placeholder {
    color: #A0AEC0;
  }
  
  @media (max-width: 768px) {
    padding: 10px 12px;
  }
`;

// Área de texto para notas
const TextArea = styled.textarea`
  padding: 12px 15px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  resize: vertical;
  min-height: 120px;
  width: 100%;
  font-size: 1rem;
  transition: all 0.2s ease;
  
  &:focus {
    border-color: #FFC001;
    outline: none;
    box-shadow: 0 0 0 3px rgba(255, 192, 1, 0.2);
  }
  
  &::placeholder {
    color: #A0AEC0;
  }
`;

// Select mejorado
const Select = styled.select`
  padding: 12px 15px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  width: 100%;
  font-size: 1rem;
  transition: all 0.2s ease;
  background-color: #FFFFFF;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 15px center;
  background-size: 16px;
  
  &:focus {
    border-color: #FFC001;
    outline: none;
    box-shadow: 0 0 0 3px rgba(255, 192, 1, 0.2);
  }
  
  &[multiple] {
    background-image: none;
    padding: 8px 12px;
  }
`;

// Botón principal
const Button = styled(motion.button)`
  background-color: #FFC001;
  color: #1A202C;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.95rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background-color: #E6AC00;
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
    color: #4A5568;
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    padding: 12px 16px;
  }
`;

// Botón secundario
const SecondaryButton = styled(Button)`
  background-color: #EDF2F7;
  color: #4A5568;
  
  &:hover {
    background-color: #E2E8F0;
  }
`;

// Botón de borrado o estado negativo
const DangerButton = styled(Button)`
  background-color: #FED7D7;
  color: #C53030;
  
  &:hover {
    background-color: #FEB2B2;
  }
`;

// Botón para activar
const SuccessButton = styled(Button)`
  background-color: #C6F6D5;
  color: #276749;
  
  &:hover {
    background-color: #9AE6B4;
  }
`;

// Contenedor para tabla con scroll
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

// Tabla mejorada
const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  overflow: hidden;
`;

// Celda de encabezado
const Th = styled.th`
  background-color: #1A202C;
  color: #FFFFFF;
  text-align: left;
  padding: 15px;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  position: sticky;
  top: 0;
  white-space: nowrap;
  
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

// Celda de datos
const Td = styled.td`
  border-bottom: 1px solid #E2E8F0;
  padding: 15px;
  font-size: 0.95rem;
  color: #4A5568;
  vertical-align: middle;
  
  @media (max-width: 768px) {
    padding: 12px 10px;
    font-size: 0.85rem;
  }
`;

// Fila de tabla con animación
const Tr = styled(motion.tr)`
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

// Mensaje de notificación
const Message = styled(motion.div)<{ isError?: boolean }>`
  margin-top: 20px;
  padding: 16px;
  border-radius: 8px;
  background-color: ${props => props.isError ? '#FFF5F5' : '#F0FFF4'};
  color: ${props => props.isError ? '#C53030' : '#276749'};
  border-left: 4px solid ${props => props.isError ? '#FC8181' : '#68D391'};
  display: flex;
  align-items: center;
  gap: 12px;
  
  svg {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
  }
  
  @media (max-width: 768px) {
    padding: 12px;
  }
`;

// Contenedor con scroll
const ScrollableContainer = styled.div`
  max-height: 600px;
  overflow-y: auto;
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  padding: 25px;
  margin-bottom: 25px;
  background-color: #F7FAFC;
  
  /* Estilo para scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #EDF2F7;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #CBD5E0;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #A0AEC0;
  }
  
  @media (max-width: 768px) {
    padding: 15px;
  }
`;

// Grupo de botones
const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
  }
`;

// Botones de acción al final del formulario
const ActionButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
  }
`;

// Contenedor de filtros
const FilterContainer = styled.div`
  margin-bottom: 25px;
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: space-between;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }
`;

// Campo de búsqueda
const SearchInput = styled(Input)`
  min-width: 300px;
  padding-left: 40px;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23A0AEC0' stroke-width='2'%3e%3cpath stroke-linecap='round' stroke-linejoin='round' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'%3e%3c/path%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: 15px center;
  background-size: 16px;
  
  @media (max-width: 768px) {
    min-width: 100%;
  }
`;

// Badge para descuentos
const DiscountBadge = styled.div`
  display: inline-block;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-right: 5px;
  margin-bottom: 5px;
  background-color: #E6FFFA;
  color: #285E61;
  
  &.automatic {
    background-color: #E6F6FF;
    color: #2C5282;
  }
`;

// Badge para estado
const StatusBadge = styled.span<{ isActive?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  background-color: ${props => props.isActive ? '#F0FFF4' : '#FFF5F5'};
  color: ${props => props.isActive ? '#276749' : '#C53030'};
  
  &::before {
    content: "";
    display: block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${props => props.isActive ? '#48BB78' : '#F56565'};
  }
`;

// Texto de ayuda
const HelperText = styled.small`
  display: block;
  margin-top: 6px;
  color: #718096;
  font-size: 0.85rem;
`;

// Indicador de carga
const LoadingSpinner = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 0;
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #E2E8F0;
    border-top: 3px solid #FFC001;
    border-radius: 50%;
  }
`;

// Alerta para descuento automático
const DiscountAlert = styled(motion.div)`
  padding: 15px;
  background-color: #F0FFF4;
  border-radius: 8px;
  border-left: 4px solid #48BB78;
  color: #276749;
  margin: 15px 0;
  display: flex;
  align-items: center;
  gap: 12px;
  
  svg {
    width: 24px;
    height: 24px;
    color: #48BB78;
    flex-shrink: 0;
  }
  
  strong {
    font-weight: 600;
  }
`;

// Estado vacío
const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
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

function Alumnos() {
  // Estado
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [estilos, setEstilos] = useState<Estilo[]>([]);
  const [editandoAlumno, setEditandoAlumno] = useState<Alumno | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingTable, setLoadingTable] = useState(true);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [filtro, setFiltro] = useState('');
  const [alumnosFiltrados, setAlumnosFiltrados] = useState<Alumno[]>([]);
  const [descuentoAutomatico, setDescuentoAutomatico] = useState<number | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoAlumno, setNuevoAlumno] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    fechaNacimiento: '',
    email: '',
    telefono: '',
    numeroEmergencia: '',
    direccion: '',
    obraSocial: '',
    nombreTutor: '',
    dniTutor: '',
    notas: '',
    estilosIds: [] as string[],
    descuentoManual: ''
  });

  // Referencia para scroll automático
  const formRef = useRef<HTMLDivElement>(null);

  // Efectos
  useEffect(() => {
    fetchAlumnos();
    fetchEstilos();
  }, []);

  // Scroll al formulario cuando se muestra
  useEffect(() => {
    if (mostrarFormulario && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [mostrarFormulario]);

  // Filtrar alumnos
  useEffect(() => {
    const filtered = alumnos.filter(alumno => 
      alumno.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
      alumno.apellido.toLowerCase().includes(filtro.toLowerCase()) ||
      alumno.dni.includes(filtro)
    );
    setAlumnosFiltrados(filtered);
  }, [filtro, alumnos]);

  // Funciones
// En el método fetchAlumnos del componente React:
const fetchAlumnos = async () => {
  setLoadingTable(true);
  try {
    const res = await fetch('/api/alumnos');
    if (!res.ok) throw new Error('Error al obtener alumnos');
    const data = await res.json();
    
    // Ordenar por fecha de creación descendente
    const sortedData = [...data].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    setAlumnos(sortedData);
    setMessage({ text: 'Alumnos cargados correctamente', isError: false });
    
    // Auto-ocultar el mensaje después de 3 segundos
    setTimeout(() => {
      setMessage(null);
    }, 3000);
  } catch (error) {
    console.error('Error fetching alumnos:', error);
    setMessage({ text: 'Error al cargar alumnos', isError: true });
  } finally {
    setLoadingTable(false);
  }
};

  const fetchEstilos = async () => {
    try {
      const res = await fetch('/api/estilos');
      if (!res.ok) throw new Error('Error al obtener estilos');
      const data = await res.json();
      setEstilos(data);
    } catch (error) {
      console.error('Error fetching estilos:', error);
      setMessage({ text: 'Error al cargar estilos', isError: true });
    }
  };

  const calcularDescuentoAutomatico = (estilosSeleccionados: string[]) => {
    if (estilosSeleccionados.length >= 2) {
      const porcentaje = estilosSeleccionados.length >= 3 ? 15 : 10;
      setDescuentoAutomatico(porcentaje);
    } else {
      setDescuentoAutomatico(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'estilosIds') {
      const selectedOptions = Array.from(
        (e.target as HTMLSelectElement).selectedOptions,
        option => option.value
      );
      setNuevoAlumno(prev => ({ ...prev, [name]: selectedOptions }));
      calcularDescuentoAutomatico(selectedOptions);
    } else {
      setNuevoAlumno(prev => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => {
    setNuevoAlumno({
      nombre: '', 
      apellido: '', 
      dni: '', 
      fechaNacimiento: '', 
      email: '', 
      telefono: '', 
      numeroEmergencia: '', 
      direccion: '', 
      obraSocial: '', 
      nombreTutor: '', 
      dniTutor: '', 
      notas: '',
      estilosIds: [], 
      descuentoManual: ''
    });
    setDescuentoAutomatico(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Obtener el concepto de inscripción
      const conceptoInscripcion = await fetch('/api/conceptos?esInscripcion=true')
        .then(res => res.json())
        .then(data => data[0]); // Asumimos que solo hay un concepto de inscripción

        const alumnoData = {
          ...nuevoAlumno,
          fechaNacimiento: new Date(nuevoAlumno.fechaNacimiento).toISOString(),
          activo: true,
          tipoAlumno: 'regular', // Especificar explícitamente
          estilosIds: nuevoAlumno.estilosIds.map(id => parseInt(id, 10)),
          descuentoManual: nuevoAlumno.descuentoManual ? parseFloat(nuevoAlumno.descuentoManual) : undefined,
        // Agregar la deuda de inscripción si existe el concepto
        deudaInscripcion: conceptoInscripcion ? {
          monto: conceptoInscripcion.monto,
          montoOriginal: conceptoInscripcion.monto,
          conceptoId: conceptoInscripcion.id,
          fechaVencimiento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días desde hoy
          pagada: false
        } : undefined
      };

      const res = await fetch('/api/alumnos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alumnoData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al crear alumno');
      }

      await res.json();
      resetForm();
      setMostrarFormulario(false);
      await fetchAlumnos();
      setMessage({ 
        text: 'Alumno creado exitosamente', 
        isError: false 
      });
      
      // Auto-ocultar el mensaje después de 3 segundos
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error creating alumno:', error);
      setMessage({ 
        text: error instanceof Error ? error.message : 'Error al crear alumno', 
        isError: true 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEstadoAlumno = async (alumnoId: number, nuevoEstado: boolean) => {
    if (!confirm(`¿Está seguro que desea ${nuevoEstado ? 'activar' : 'dar de baja'} a este alumno?`)) {
      return;
    }
    
    try {
      setLoading(true);
      const res = await fetch('/api/alumnos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: alumnoId, activo: nuevoEstado }),
      });
      if (!res.ok) throw new Error('Error al actualizar estado');
      await fetchAlumnos();
      setMessage({ 
        text: `Estado del alumno actualizado correctamente`, 
        isError: false 
      });
      
      // Auto-ocultar el mensaje después de 3 segundos
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error:', error);
      setMessage({ 
        text: 'Error al actualizar estado', 
        isError: true 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEstiloAlumno = async (alumnoId: number, estiloId: number) => {
    try {
      setLoading(true);
      // Obtener el estado actual del estilo para este alumno
      const alumno = alumnos.find(a => a.id === alumnoId);
      const estiloActual = alumno?.alumnoEstilos.find(ae => ae.estilo.id === estiloId);
      const nuevoEstado = !estiloActual?.activo; // Si estaba activo, lo desactivamos y viceversa

      const res = await fetch('/api/alumnos/estilos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alumnoId,
          estiloId,
          activo: nuevoEstado
        }),
      });

      if (!res.ok) {
        throw new Error('Error al actualizar estilo del alumno');
      }

      await fetchAlumnos(); // Recargar los datos
      setMessage({ 
        text: `Estilo ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`, 
        isError: false 
      });
      
      // Auto-ocultar el mensaje después de 3 segundos
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error al actualizar estilo:', error);
      setMessage({ 
        text: 'Error al actualizar estilo del alumno', 
        isError: true 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGuardarEdicion = async (alumnoData: any) => {
    try {
      setLoading(true);
      const res = await fetch('/api/alumnos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alumnoData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al actualizar alumno');
      }

      await res.json();
      await fetchAlumnos();
      setEditandoAlumno(null);
      setMessage({ 
        text: 'Alumno actualizado correctamente', 
        isError: false 
      });
      
      // Auto-ocultar el mensaje después de 3 segundos
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error:', error);
      setMessage({ 
        text: error instanceof Error ? error.message : 'Error al actualizar alumno', 
        isError: true 
      });
    } finally {
      setLoading(false);
    }
  };

  // Render
  return (
    <PageContainer>
      <Container>
        <Title>Gestión de Alumnos</Title>

        <FilterContainer>
          <Button 
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            {mostrarFormulario ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancelar Registro
              </>
            ) : (
              <>
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Registrar Nuevo Alumno
              </>
            )}
          </Button>
          
          <SearchInput
            type="text"
            placeholder="Buscar por nombre, apellido o DNI..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </FilterContainer>

        {/* Formulario de registro */}
        <AnimatePresence>
          {mostrarFormulario && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              ref={formRef}
            >
              <ScrollableContainer>
                <Form onSubmit={handleSubmit}>
                  {/* Información Básica */}
                  <FormSection>
                    <SectionTitle>Información Básica</SectionTitle>
                    <FormGrid>
                      <FormField>
                        <Label htmlFor="nombre">Nombre *</Label>
                        <Input
                          id="nombre"
                          type="text"
                          name="nombre"
                          value={nuevoAlumno.nombre}
                          onChange={handleInputChange}
                          required
                        />
                      </FormField>

                      <FormField>
                        <Label htmlFor="apellido">Apellido *</Label>
                        <Input
                          id="apellido"
                          type="text"
                          name="apellido"
                          value={nuevoAlumno.apellido}
                          onChange={handleInputChange}
                          required
                        />
                      </FormField>

                      <FormField>
                        <Label htmlFor="dni">DNI *</Label>
                        <Input
                          id="dni"
                          type="text"
                          name="dni"
                          value={nuevoAlumno.dni}
                          onChange={handleInputChange}
                          required
                        />
                      </FormField>

                      <FormField>
                        <Label htmlFor="fechaNacimiento">Fecha de Nacimiento *</Label>
                        <Input
                          id="fechaNacimiento"
                          type="date"
                          name="fechaNacimiento"
                          value={nuevoAlumno.fechaNacimiento}
                          onChange={handleInputChange}
                          required
                        />
                      </FormField>

                      <FormField>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          name="email"
                          value={nuevoAlumno.email}
                          onChange={handleInputChange}
                          placeholder="ejemplo@email.com"
                        />
                      </FormField>

                      <FormField>
                        <Label htmlFor="telefono">Teléfono</Label>
                        <Input
                          id="telefono"
                          type="tel"
                          name="telefono"
                          value={nuevoAlumno.telefono}
                          onChange={handleInputChange}
                          placeholder="+54 "
                        />
                      </FormField>
                    </FormGrid>
                  </FormSection>

                  {/* Información de Contacto y Emergencia */}
                  <FormSection>
                    <SectionTitle>Información de Contacto y Emergencia</SectionTitle>
                    <FormGrid>
                      <FormField>
                        <Label htmlFor="numeroEmergencia">Número de Emergencia</Label>
                        <Input
                          id="numeroEmergencia"
                          type="tel"
                          name="numeroEmergencia"
                          value={nuevoAlumno.numeroEmergencia}
                          onChange={handleInputChange}
                          placeholder="+54 "
                        />
                      </FormField>

                      <FormField>
                        <Label htmlFor="obraSocial">Obra Social</Label>
                        <Input
                          id="obraSocial"
                          type="text"
                          name="obraSocial"
                          value={nuevoAlumno.obraSocial}
                          onChange={handleInputChange}
                        />
                      </FormField>
                    </FormGrid>

                    <FormField>
                      <Label htmlFor="direccion">Dirección</Label>
                      <Input
                        id="direccion"
                        type="text"
                        name="direccion"
                        value={nuevoAlumno.direccion}
                        onChange={handleInputChange}
                        placeholder="Calle, Número, Ciudad"
                      />
                    </FormField>
                  </FormSection>

                  {/* Información del Tutor */}
                  <FormSection>
                    <SectionTitle>Información del Tutor</SectionTitle>
                    <FormGrid>
                      <FormField>
                        <Label htmlFor="nombreTutor">Nombre del Tutor</Label>
                        <Input
                          id="nombreTutor"
                          type="text"
                          name="nombreTutor"
                          value={nuevoAlumno.nombreTutor}
                          onChange={handleInputChange}
                        />
                      </FormField>

                      <FormField>
                        <Label htmlFor="dniTutor">DNI del Tutor</Label>
                        <Input
                          id="dniTutor"
                          type="text"
                          name="dniTutor"
                          value={nuevoAlumno.dniTutor}
                          onChange={handleInputChange}
                        />
                      </FormField>
                    </FormGrid>
                  </FormSection>

                  {/* Estilos y Descuentos */}
                  <FormSection>
                    <SectionTitle>Estilos y Descuentos</SectionTitle>
                    <FormField>
                      <Label htmlFor="estilosIds">Estilos</Label>
                      <Select
                        id="estilosIds"
                        name="estilosIds"
                        multiple
                        value={nuevoAlumno.estilosIds}
                        onChange={handleInputChange}
                        style={{ height: '120px' }}
                      >
                        {estilos.map(estilo => (
                          <option key={estilo.id} value={estilo.id.toString()}>
                            {estilo.nombre}
                          </option>
                        ))}
                      </Select>
                      <HelperText>
                        Mantén presionado Ctrl (o Cmd en Mac) para seleccionar múltiples estilos
                      </HelperText>
                    </FormField>

                    <AnimatePresence>
                      {descuentoAutomatico && (
                        <DiscountAlert
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <strong>Descuento automático:</strong> {descuentoAutomatico}% por inscripción a múltiples estilos
                          </div>
                        </DiscountAlert>
                      )}
                    </AnimatePresence>

                    <FormField>
                      <Label htmlFor="descuentoManual">Descuento Manual (%)</Label>
                      <Input
                        id="descuentoManual"
                        type="number"
                        name="descuentoManual"
                        value={nuevoAlumno.descuentoManual}
                        onChange={handleInputChange}
                        min="0"
                        max="100"
                        step="1"
                        placeholder="0"
                      />
                      <HelperText>
                        Solo si corresponde un descuento adicional o diferente al automático
                      </HelperText>
                    </FormField>
                  </FormSection>

                  {/* Notas Adicionales */}
                  <FormSection>
                    <SectionTitle>Notas Adicionales</SectionTitle>
                    <FormField>
                      <Label htmlFor="notas">Observaciones</Label>
                      <TextArea
                        id="notas"
                        name="notas"
                        value={nuevoAlumno.notas}
                        onChange={handleInputChange}
                        placeholder="Información adicional relevante sobre el alumno..."
                      />
                    </FormField>
                  </FormSection>

                  {/* Botones de acción */}
                  <ActionButtons>
                    <SecondaryButton 
                      type="button" 
                      onClick={() => {
                        resetForm();
                        setMostrarFormulario(false);
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancelar
                    </SecondaryButton>
                    <Button 
                      type="submit" 
                      disabled={loading}
                      whileHover={{ scale: loading ? 1 : 1.02 }}
                      whileTap={{ scale: loading ? 1 : 0.98 }}
                    >
                      {loading ? (
                        <>
                          <motion.div 
                            className="spinner"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            style={{ width: 20, height: 20, borderRadius: '50%', borderTop: '2px solid #FFF', borderRight: '2px solid transparent', borderBottom: '2px solid #FFF', borderLeft: '2px solid #FFF' }}
                          />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Registrar Alumno
                        </>
                      )}
                    </Button>
                  </ActionButtons>
                </Form>
              </ScrollableContainer>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Listado de alumnos */}
        {loadingTable ? (
          <LoadingSpinner>
            <motion.div 
              className="spinner"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </LoadingSpinner>
        ) : (
          <TableContainer>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Table>
                <thead>
                  <tr>
                    <Th>Nombre</Th>
                    <Th>Apellido</Th>
                    <Th>DNI</Th>
                    <Th>Email</Th>
                    <Th>Teléfono</Th>
                    <Th>Estado</Th>
                    <Th>Estilos</Th>
                    <Th>Descuentos</Th>
                    <Th>Acciones</Th>
                  </tr>
                </thead>
                <tbody>
                  {alumnosFiltrados.length > 0 ? (
                    alumnosFiltrados.map((alumno, index) => (
                      <Tr 
                        key={alumno.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.03 }}
                      >
                        <Td>{alumno.nombre}</Td>
                        <Td>{alumno.apellido}</Td>
                        <Td>{alumno.dni}</Td>
                        <Td>{alumno.email || '-'}</Td>
                        <Td>{alumno.telefono || '-'}</Td>
                        <Td>
                          <StatusBadge isActive={alumno.activo}>
                            {alumno.activo ? 'Activo' : 'Inactivo'}
                          </StatusBadge>
                        </Td>
                        <Td>
                          <EstilosComponent
                            alumnoEstilos={alumno.alumnoEstilos}
                            onEstiloToggle={(estiloId) => handleEstiloAlumno(alumno.id, estiloId)}
                            alumnoId={alumno.id}
                          />
                        </Td>
                        <Td>
                          {alumno.descuentosVigentes?.length > 0 ? (
                            <div>
                              {alumno.descuentosVigentes.map((d: any) => (
                                <DiscountBadge 
                                  key={d.id}
                                  className={d.descuento.esAutomatico ? 'automatic' : ''}
                                >
                                  {d.descuento.esAutomatico ? 'Auto' : 'Manual'}: {d.descuento.porcentaje}%
                                </DiscountBadge>
                              ))}
                            </div>
                          ) : (
                            '-'
                          )}
                        </Td>
                        <Td>
                          <ButtonGroup>
                            <Button 
                              onClick={() => setEditandoAlumno(alumno)}
                              style={{ fontSize: '0.9rem', padding: '8px 12px' }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Editar
                            </Button>
                            {alumno.activo ? (
                              <DangerButton 
                                onClick={() => handleEstadoAlumno(alumno.id, !alumno.activo)}
                                style={{ fontSize: '0.9rem', padding: '8px 12px' }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                                Dar de Baja
                              </DangerButton>
                            ) : (
                              <SuccessButton 
                                onClick={() => handleEstadoAlumno(alumno.id, !alumno.activo)}
                                style={{ fontSize: '0.9rem', padding: '8px 12px' }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Reactivar
                              </SuccessButton>
                            )}
                          </ButtonGroup>
                        </Td>
                      </Tr>
                    ))
                  ) : (
                    <Tr>
                      <Td colSpan={9}>
                        <EmptyState>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <h3>{filtro ? 'No se encontraron alumnos con ese filtro' : 'No hay alumnos registrados'}</h3>
                          <p>{filtro ? 'Intenta con otros términos de búsqueda' : 'Registra un nuevo alumno para comenzar'}</p>
                        </EmptyState>
                      </Td>
                    </Tr>
                  )}
                </tbody>
              </Table>
            </motion.div>
          </TableContainer>
        )}

        {/* Modal de edición */}
        <AnimatePresence>
          {editandoAlumno && (
            <EditAlumnoModal
              alumno={editandoAlumno}
              estilos={estilos}
              onClose={() => setEditandoAlumno(null)}
              onSave={handleGuardarEdicion}
            />
          )}
        </AnimatePresence>

        {/* Mensajes de feedback */}
        <AnimatePresence>
          {message && (
            <Message 
              isError={message.isError}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
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
        </AnimatePresence>
      </Container>
    </PageContainer>
  );
}

export default Alumnos;