import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchAuthSession } from 'aws-amplify/auth';

// Contenedor principal
const Container = styled.div`
  padding: 30px;
  background-color: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  
  @media (max-width: 768px) {
    padding: 20px 15px;
    border-radius: 0;
  }
`;

// Título de sección con diseño mejorado
const SectionTitle = styled.h2`
  color: #1A202C;
  font-size: 1.6rem;
  font-weight: 700;
  margin: 40px 0 25px;
  padding-bottom: 12px;
  border-bottom: 3px solid #FFC001;
  display: inline-block;
  position: relative;

  &:first-child {
    margin-top: 0;
  }

  &:after {
    content: '';
    position: absolute;
    bottom: -3px;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(to right, #FFC001 0%, #FFC001 70%, transparent 100%);
  }
  
  @media (max-width: 768px) {
    font-size: 1.4rem;
    margin: 30px 0 20px;
  }
`;

// Contenedor para el filtro de fechas
const FilterContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 25px;
  align-items: flex-end;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
`;

// Grupo de entradas con etiqueta
const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

// Etiqueta para campos
const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  color: #4A5568;
`;

// Campo de entrada con estilo mejorado
const Input = styled.input`
  padding: 12px 15px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-size: 1rem;
  color: #1A202C;
  background-color: #FFFFFF;
  min-width: 160px;
  
  &:focus {
    outline: none;
    border-color: #FFC001;
    box-shadow: 0 0 0 3px rgba(255, 192, 1, 0.2);
  }
  
  &::placeholder {
    color: #A0AEC0;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    padding: 10px 12px;
  }
`;

// Botón primario
const Button = styled(motion.button)`
  background-color: #FFC001;
  color: #1A202C;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 120px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  
  &:hover {
    background-color: #E6AC00;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  }
  
  &:active {
    transform: translateY(0);
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

// Botón de eliminar
const DeleteButton = styled(Button)`
  background-color: #FEE2E2;
  color: #E53E3E;
  padding: 8px 12px;
  min-width: auto;
  font-size: 0.85rem;
  
  &:hover {
    background-color: #FED7D7;
    color: #C53030;
  }
`;

// Botón para expandir/colapsar
const ExpandButton = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  color: #4A5568;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  margin-right: 10px;
  
  &:hover {
    background-color: #EDF2F7;
    color: #2D3748;
  }
`;

// Contenedor para tablas con scroll horizontal
const TableContainer = styled.div`
  overflow-x: auto;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
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

// Tabla con diseño mejorado
const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  overflow: hidden;
  
  &.nested-table {
    box-shadow: none;
    margin: 0;
    border-radius: 0;
    
    th {
      background-color: #4A5568;
      font-size: 0.85rem;
    }
  }
`;

// Celda de encabezado con mejor diseño
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
  padding: 14px 15px;
  border-bottom: 1px solid #E2E8F0;
  color: #4A5568;
  font-size: 0.95rem;
  vertical-align: middle;
  background-color: #FFFFFF;
  
  &.expandable-cell {
    padding: 0;
    background-color: #F7FAFC;
  }
  
  @media (max-width: 768px) {
    padding: 12px 10px;
    font-size: 0.85rem;
  }
`;

// Fila de tabla con animación
const Tr = styled(motion.tr)`
  transition: background-color 0.2s ease;
  
  &:nth-child(even):not(.expanded-row) {
    background-color: #F7FAFC;
    
    td {
      background-color: #F7FAFC;
    }
  }
  
  &:hover:not(.expanded-row) {
    background-color: #EDF2F7;
    
    td {
      background-color: #EDF2F7;
    }
  }
  
  &.expanded-row {
    background-color: #F7FAFC;
  }
`;

// Badge para estado
const Badge = styled.span<{ status?: 'success' | 'warning' | 'danger' }>`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background-color: ${props => {
    switch (props.status) {
      case 'success': return '#F0FFF4';
      case 'warning': return '#FFFBEB';
      case 'danger': return '#FFF5F5';
      default: return '#EDF2F7';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'success': return '#276749';
      case 'warning': return '#C05621';
      case 'danger': return '#C53030';
      default: return '#4A5568';
    }
  }};
`;

// Contador de elementos
const CountBadge = styled.span`
  background-color: #E2E8F0;
  color: #4A5568;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 20px;
  margin-left: 8px;
`;

// Mensaje de estado (carga, error, etc.)
const StatusMessage = styled(motion.div)<{ type?: 'error' | 'success' | 'info' }>`
  padding: 15px;
  border-radius: 8px;
  margin: 20px 0;
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: ${props => {
    switch (props.type) {
      case 'error': return '#FFF5F5';
      case 'success': return '#F0FFF4';
      default: return '#EBF8FF';
    }
  }};
  color: ${props => {
    switch (props.type) {
      case 'error': return '#C53030';
      case 'success': return '#276749';
      default: return '#2B6CB0';
    }
  }};
  
  svg {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
  }
`;

// Contenedor de acciones
const Actions = styled.div`
  display: flex;
  gap: 10px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
  }
`;

// Estado de carga
const LoadingSpinner = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 0;
  
  .spinner {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 3px solid #E2E8F0;
    border-top-color: #FFC001;
  }
`;

// Mensaje para estado sin datos
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

// Contenedor de alumnos en fila expandida
const AlumnosContainer = styled.div`
  padding: 15px;
  background-color: #F7FAFC;
  border-radius: 8px;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
`;

// Interfaces para los tipos de datos
interface AlumnoSuelto {
  id: number;
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  createdAt: string;
}

interface Clase {
  id: number;
  fecha: string;
  profesor: {
    nombre: string;
    apellido: string;
  };
  estilo: {
    nombre: string;
  };
  asistencias: {
    id: number;
    asistio: boolean;
    alumno: {
      nombre: string;
      apellido: string;
    };
  }[];
  alumnosSueltos: {
    id: number;
    nombre: string;
    apellido: string;
  }[];
}

const AlumnosSueltosAsistencia: React.FC = () => {
  const [alumnosSueltos, setAlumnosSueltos] = useState<AlumnoSuelto[]>([]);
  const [clases, setClases] = useState<Clase[]>([]);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [expandedClases, setExpandedClases] = useState<number[]>([]);
  const [loading, setLoading] = useState<{ alumnos: boolean; clases: boolean }>({ alumnos: false, clases: false });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchData = useCallback(async (type: 'alumnos-sueltos' | 'clases') => {
    try {
      setError(null);
      if (type === 'alumnos-sueltos') {
        setLoading(prev => ({ ...prev, alumnos: true }));
      } else {
        setLoading(prev => ({ ...prev, clases: true }));
      }

      const session = await fetchAuthSession();
      const token = session.tokens?.accessToken?.toString();

      if (!token) {
        throw new Error('No se pudo obtener el token de acceso');
      }

      let url = `/api/alumnos-sueltos-asistencia?type=${type}`;
      if (type === 'clases' && fechaInicio && fechaFin) {
        url += `&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener los datos');
      }

      const data = await response.json();
      if (type === 'alumnos-sueltos') {
        setAlumnosSueltos(data);
      } else {
        setClases(data);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error al obtener los datos. Por favor, intente de nuevo.');
    } finally {
      if (type === 'alumnos-sueltos') {
        setLoading(prev => ({ ...prev, alumnos: false }));
      } else {
        setLoading(prev => ({ ...prev, clases: false }));
      }
    }
  }, [fechaInicio, fechaFin]);

  useEffect(() => {
    fetchData('alumnos-sueltos');
  }, [fetchData]);

  const handleDelete = async (id: number, type: 'alumno-suelto' | 'clase') => {
    try {
      setError(null);
      
      if (!confirm('¿Está seguro que desea eliminar este registro? Esta acción no se puede deshacer.')) {
        return;
      }
      
      const session = await fetchAuthSession();
      const token = session.tokens?.accessToken?.toString();

      if (!token) {
        throw new Error('No se pudo obtener el token de acceso');
      }

      const response = await fetch(`/api/alumnos-sueltos-asistencia?type=${type}&id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar');
      }

      if (type === 'alumno-suelto') {
        setAlumnosSueltos(prev => prev.filter(alumno => alumno.id !== id));
      } else {
        setClases(prev => prev.filter(clase => clase.id !== id));
      }

      setSuccessMessage(`${type === 'alumno-suelto' ? 'Alumno suelto' : 'Clase'} eliminado con éxito`);
      
      // Auto-ocultar mensaje después de 3 segundos
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error:', error);
      setError('Error al eliminar. Por favor, intente de nuevo.');
    }
  };

  const toggleExpand = (claseId: number) => {
    setExpandedClases(prev => 
      prev.includes(claseId) 
        ? prev.filter(id => id !== claseId)
        : [...prev, claseId]
    );
  };

  const formatDate = (dateString: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Date(dateString).toLocaleDateString('es-AR', options);
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Container>
      <AnimatePresence>
        {error && (
          <StatusMessage 
            type="error"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </StatusMessage>
        )}
        
        {successMessage && (
          <StatusMessage 
            type="success"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {successMessage}
          </StatusMessage>
        )}
      </AnimatePresence>

      <SectionTitle>Alumnos Sueltos</SectionTitle>
      
      {loading.alumnos ? (
        <LoadingSpinner>
          <motion.div 
            className="spinner"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </LoadingSpinner>
      ) : alumnosSueltos.length === 0 ? (
        <EmptyState>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3>No hay alumnos sueltos</h3>
          <p>No se encontraron registros de alumnos sueltos en el sistema.</p>
        </EmptyState>
      ) : (
        <TableContainer>
          <Table>
            <thead>
              <tr>
                <Th>Nombre</Th>
                <Th>Apellido</Th>
                <Th>Teléfono</Th>
                <Th>Email</Th>
                <Th>Fecha de Creación</Th>
                <Th>Acciones</Th>
              </tr>
            </thead>
            <tbody>
              {alumnosSueltos.map((alumno, index) => (
                <Tr 
                  key={alumno.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                >
                  <Td>{alumno.nombre}</Td>
                  <Td>{alumno.apellido}</Td>
                  <Td>{alumno.telefono || '-'}</Td>
                  <Td>{alumno.email || '-'}</Td>
                  <Td>{formatDate(alumno.createdAt)}</Td>
                  <Td>
                    <DeleteButton 
                      onClick={() => handleDelete(alumno.id, 'alumno-suelto')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Eliminar
                    </DeleteButton>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </TableContainer>
      )}

      <SectionTitle>Clases dictadas</SectionTitle>
      
      <FilterContainer>
        <InputGroup>
          <Label htmlFor="fechaInicio">Fecha Desde</Label>
          <Input
            id="fechaInicio"
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
          />
        </InputGroup>
        
        <InputGroup>
          <Label htmlFor="fechaFin">Fecha Hasta</Label>
          <Input
            id="fechaFin"
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
          />
        </InputGroup>
        
        <Button 
          onClick={() => fetchData('clases')} 
          disabled={loading.clases}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          {loading.clases ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                style={{ width: 18, height: 18, borderRadius: '50%', borderTop: '2px solid #FFF', borderRight: '2px solid transparent', borderBottom: '2px solid #FFF', borderLeft: '2px solid #FFF' }}
              />
              Buscando...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Buscar
            </>
          )}
        </Button>
      </FilterContainer>
      
      {loading.clases ? (
        <LoadingSpinner>
          <motion.div 
            className="spinner"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </LoadingSpinner>
      ) : clases.length === 0 ? (
        <EmptyState>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3>No hay clases</h3>
          <p>No se encontraron clases en el período seleccionado.</p>
        </EmptyState>
      ) : (
        <TableContainer>
          <Table>
            <thead>
              <tr>
                <Th>Fecha</Th>
                <Th>Profesor</Th>
                <Th>Estilo</Th>
                <Th>Alumnos</Th>
                <Th>Acciones</Th>
              </tr>
            </thead>
            <tbody>
              {clases.map((clase, index) => (
                <React.Fragment key={clase.id}>
                  <Tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                  >
                    <Td>{formatDate(clase.fecha)}</Td>
                    <Td>{`${clase.profesor.nombre} ${clase.profesor.apellido}`}</Td>
                    <Td>{clase.estilo.nombre}</Td>
                    <Td>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <ExpandButton onClick={() => toggleExpand(clase.id)}>
                          {expandedClases.includes(clase.id) ? '▼' : '▶'}
                        </ExpandButton>
                        <span>Alumnos</span>
                        <CountBadge>
                          {clase.asistencias.length + clase.alumnosSueltos.length}
                        </CountBadge>
                      </div>
                    </Td>
                    <Td>
                      <DeleteButton 
                        onClick={() => handleDelete(clase.id, 'clase')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Eliminar
                      </DeleteButton>
                    </Td>
                  </Tr>
                  
                  <AnimatePresence>
                    {expandedClases.includes(clase.id) && (
                      <Tr 
                        className="expanded-row"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Td colSpan={5} className="expandable-cell">
                          <AlumnosContainer>
                            <Table className="nested-table">
                              <thead>
                                <tr>
                                  <Th>Alumno</Th>
                                  <Th>Tipo</Th>
                                  <Th>Asistencia</Th>
                                </tr>
                              </thead>
                              <tbody>
                                {clase.asistencias.map(asistencia => (
                                  <Tr key={asistencia.id}>
                                    <Td>{`${asistencia.alumno.nombre} ${asistencia.alumno.apellido}`}</Td>
                                    <Td>
                                      <Badge>Regular</Badge>
                                    </Td>
                                    <Td>
                                      <Badge status={asistencia.asistio ? 'success' : 'danger'}>
                                        {asistencia.asistio ? 'Asistió' : 'No asistió'}
                                      </Badge>
                                    </Td>
                                  </Tr>
                                ))}
                                {clase.alumnosSueltos.map(alumnoSuelto => (
                                  <Tr key={alumnoSuelto.id}>
                                    <Td>{`${alumnoSuelto.nombre} ${alumnoSuelto.apellido}`}</Td>
                                    <Td>
                                      <Badge status="warning">Suelto</Badge>
                                    </Td>
                                    <Td>
                                      <Badge status="success">Asistió</Badge>
                                    </Td>
                                  </Tr>
                                ))}
                              </tbody>
                            </Table>
                          </AlumnosContainer>
                        </Td>
                      </Tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))}
            </tbody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default AlumnosSueltosAsistencia;