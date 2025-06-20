// src/components/asistencia/TomarAsistencia.tsx
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchAuthSession } from 'aws-amplify/auth';
import { Calendar, Users, Clock, Plus, Check, X, Filter, Search, ChevronLeft, ChevronRight, BookOpen, UserPlus, Save, AlertCircle, CheckCircle, History, Eye } from 'lucide-react';

// Interfaces
interface Profesor {
  id: number;
  nombre: string;
  apellido: string;
}

interface Estilo {
  id: number;
  nombre: string;
  profesorId?: number;
}

interface Alumno {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  estiloId?: number;
}

interface AsistenciaData {
  id: number;
  alumnoId: number;
  asistio: boolean;
  alumno: {
    nombre: string;
    apellido: string;
  };
}

interface Clase {
  id: number;
  fecha: string;
  profesorId: number;
  estiloId: number;
  hora?: string;
  profesor?: {
    nombre: string;
    apellido: string;
  };
  estilo?: {
    nombre: string;
  };
  asistencias?: AsistenciaData[];
  alumnosSueltos?: {
    id: number;
    nombre: string;
    apellido: string;
  }[];
}

interface AlumnoSuelto {
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  email: string;
}

interface AttendanceState {
  [key: number]: boolean;
}

interface NewClassData {
  profesorId: string;
  estiloId: string;
  fecha: string;
  hora: string;
}

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background-color: #f8fafc;
  padding: 1.5rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const MainWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const IconWrapper = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  background: #fef3c7;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const HeaderText = styled.div`
  h1 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 0.25rem 0;
  }
  
  p {
    color: #6b7280;
    margin: 0;
  }
`;

const ViewToggle = styled.div`
  display: flex;
  background: #f3f4f6;
  border-radius: 8px;
  padding: 0.25rem;
`;

const ViewButton = styled.button<{ active: boolean }>`
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  
  background: ${props => props.active ? 'white' : 'transparent'};
  color: ${props => props.active ? '#1f2937' : '#6b7280'};
  box-shadow: ${props => props.active ? '0 1px 2px rgba(0, 0, 0, 0.05)' : 'none'};
  
  &:hover {
    color: #1f2937;
  }
`;

const FiltersCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const FiltersContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
`;

const FiltersLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
  }
`;

const Select = styled.select`
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #374151;
  background: white;
  min-width: 160px;
  
  &:focus {
    outline: none;
    border-color: #fbbf24;
    box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.1);
  }
  
  &:disabled {
    background: #f9fafb;
    color: #9ca3af;
  }
`;

const PrimaryButton = styled.button`
  padding: 0.5rem 1rem;
  background: #fbbf24;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: #f59e0b;
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    background: #d1d5db;
    cursor: not-allowed;
    transform: none;
  }
`;

const CalendarCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  overflow: hidden;
`;

const CalendarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
`;

const CalendarNav = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const NavButton = styled.button`
  padding: 0.5rem;
  border: none;
  background: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #f3f4f6;
  }
`;

const MonthTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
`;

const TodayButton = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  color: #6b7280;
  border-radius: 8px;
  cursor: pointer;
  transition: color 0.2s;
  
  &:hover {
    color: #1f2937;
  }
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
`;

const WeekdayHeader = styled.div`
  padding: 1rem;
  text-align: center;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  background: #f9fafb;
  border-right: 1px solid #e2e8f0;
  
  &:last-child {
    border-right: none;
  }
`;

const CalendarDay = styled.div<{ hasClasses: boolean; isToday: boolean; isEmpty: boolean }>`
  min-height: 120px;
  padding: 0.5rem;
  border-right: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
  background: ${props => {
    if (props.isEmpty) return '#fafafa';
    if (props.isToday) return '#fffbeb';
    return 'white';
  }};
  cursor: ${props => props.isEmpty ? 'default' : 'pointer'};
  transition: background 0.2s;
  
  &:hover {
    background: ${props => props.isEmpty ? '#fafafa' : '#f9fafb'};
  }
  
  &:last-child {
    border-right: none;
  }
`;

const DayNumber = styled.div<{ isToday: boolean }>`
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  color: ${props => props.isToday ? '#f59e0b' : '#1f2937'};
  font-weight: ${props => props.isToday ? '600' : '400'};
`;

const ClassItem = styled.div`
  background: #fef3c7;
  border: 1px solid #fcd34d;
  color: #92400e;
  font-size: 0.75rem;
  padding: 0.5rem;
  border-radius: 6px;
  margin-bottom: 0.25rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #fde68a;
    transform: translateY(-1px);
  }
  
  .class-title {
    font-weight: 500;
    margin-bottom: 0.125rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .class-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.625rem;
  }
`;

const ListCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  padding: 1.5rem;
`;

const ListHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ListTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
`;

const ClassListItem = styled.div`
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f9fafb;
    border-color: #fbbf24;
  }
`;

const ClassListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const ClassTitle = styled.h4`
  font-weight: 500;
  color: #1f2937;
  margin: 0;
`;

const ClassInfo = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
`;

const ClassStats = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.875rem;
  color: #6b7280;
`;

const Modal = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 50;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ModalTitle = styled.div`
  h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 0.25rem 0;
  }
  
  p {
    font-size: 0.875rem;
    color: #6b7280;
    margin: 0;
  }
`;

const CloseButton = styled.button`
  padding: 0.5rem;
  border: none;
  background: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #f3f4f6;
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
  flex: 1;
  overflow-y: auto;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
`;

const Input = styled.input`
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
    border-color: #fbbf24;
    box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.1);
  }
`;

const AttendanceItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  
  .student-info {
    font-weight: 500;
    color: #1f2937;
  }
`;

const AttendanceButton = styled.button<{ present: boolean }>`
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  
  background: ${props => props.present ? '#dcfce7' : '#fee2e2'};
  color: ${props => props.present ? '#16a34a' : '#dc2626'};
  
  &:hover {
    background: ${props => props.present ? '#bbf7d0' : '#fecaca'};
  }
`;

const NewStudentButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  background: none;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  
  &:hover {
    border-color: #fbbf24;
    color: #f59e0b;
  }
`;

const NewStudentForm = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  
  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
    
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }
  
  .form-actions {
    display: flex;
    gap: 0.5rem;
  }
`;

const FormInput = styled.input`
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
    border-color: #fbbf24;
    box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.1);
  }
`;

const ModalFooter = styled.div`
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
  background: #f9fafb;
  display: flex;
  justify-content: space-between;
`;

const SecondaryButton = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  color: #6b7280;
  border-radius: 8px;
  cursor: pointer;
  transition: color 0.2s;
  
  &:hover {
    color: #1f2937;
  }
`;

const SaveButton = styled.button`
  padding: 0.5rem 1.5rem;
  background: #fbbf24;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: #f59e0b;
  }
  
  &:disabled {
    background: #d1d5db;
    cursor: not-allowed;
  }
`;

const MessageAlert = styled(motion.div)<{ type: 'success' | 'error' }>`
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  background: ${props => props.type === 'success' ? '#f0fdf4' : '#fef2f2'};
  color: ${props => props.type === 'success' ? '#166534' : '#dc2626'};
  border: 1px solid ${props => props.type === 'success' ? '#bbf7d0' : '#fecaca'};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
  
  .icon {
    width: 3rem;
    height: 3rem;
    margin: 0 auto 1rem;
    color: #d1d5db;
  }
  
  h3 {
    font-size: 1.125rem;
    color: #374151;
    margin-bottom: 0.5rem;
  }
`;

const TomarAsistencia: React.FC = () => {
  // Estados principales
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [estilos, setEstilos] = useState<Estilo[]>([]);
  const [alumnosDelEstilo, setAlumnosDelEstilo] = useState<Alumno[]>([]);
  const [clases, setClases] = useState<Clase[]>([]);
  const [selectedView, setSelectedView] = useState<'calendar' | 'list' | 'history'>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Estados de filtros
  const [selectedFilters, setSelectedFilters] = useState({
    profesorId: '',
    estiloId: ''
  });
  
  // Estados de modales
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showNewClassModal, setShowNewClassModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Clase | null>(null);
  
  // Estados de formularios
  const [attendanceData, setAttendanceData] = useState<AttendanceState>({});
  const [newClassData, setNewClassData] = useState<NewClassData>({
    profesorId: '',
    estiloId: '',
    fecha: new Date().toISOString().split('T')[0],
    hora: ''
  });
  const [newStudentData, setNewStudentData] = useState<AlumnoSuelto>({
    nombre: '',
    apellido: '',
    dni: '',
    telefono: '',
    email: ''
  });
  const [showNewStudentForm, setShowNewStudentForm] = useState(false);
  const [alumnosSueltos, setAlumnosSueltos] = useState<AlumnoSuelto[]>([]);
  
  // Estados de control
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Efectos
  useEffect(() => {
    fetchProfesores();
    fetchClasesHistorial();
  }, []);

  useEffect(() => {
    if (selectedFilters.profesorId) {
      fetchEstilosProfesor(parseInt(selectedFilters.profesorId));
    } else {
      setEstilos([]);
      setSelectedFilters(prev => ({ ...prev, estiloId: '' }));
    }
  }, [selectedFilters.profesorId]);

  useEffect(() => {
    if (selectedFilters.estiloId) {
      fetchAlumnosEstilo(parseInt(selectedFilters.estiloId));
    } else {
      setAlumnosDelEstilo([]);
    }
  }, [selectedFilters.estiloId]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Funciones de fetch
  const fetchProfesores = async () => {
    try {
      const res = await fetch('/api/profesores');
      if (!res.ok) throw new Error('Error al obtener profesores');
      const data = await res.json();
      setProfesores(data);
    } catch (error) {
      console.error('Error:', error);
      setMessage({ text: 'Error al cargar profesores', type: 'error' });
    }
  };

  const fetchEstilosProfesor = async (profesorId: number) => {
    try {
      const res = await fetch(`/api/profesores/${profesorId}/estilos`);
      if (!res.ok) throw new Error('Error al obtener estilos');
      const data = await res.json();
      setEstilos(data);
    } catch (error) {
      console.error('Error:', error);
      setMessage({ text: 'Error al cargar estilos', type: 'error' });
    }
  };

  const fetchAlumnosEstilo = async (estiloId: number) => {
    try {
      const res = await fetch(`/api/alumnos-por-estilo?estiloId=${estiloId}`);
      if (!res.ok) throw new Error('Error al obtener alumnos');
      const data = await res.json();
      setAlumnosDelEstilo(data);
    } catch (error) {
      console.error('Error:', error);
      setMessage({ text: 'Error al cargar alumnos', type: 'error' });
    }
  };

  const fetchClasesHistorial = async () => {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.accessToken?.toString();

      if (!token) return;

      // Obtener clases del mes actual y anterior
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const res = await fetch(`/api/alumnos-sueltos-asistencia?type=clases&fechaInicio=${startDate.toISOString().split('T')[0]}&fechaFin=${endDate.toISOString().split('T')[0]}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setClases(data);
      }
    } catch (error) {
      console.error('Error al cargar clases:', error);
    }
  };

  // Handlers
  const handleProfesorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFilters(prev => ({ 
      ...prev, 
      profesorId: e.target.value, 
      estiloId: '' 
    }));
    setNewClassData(prev => ({ 
      ...prev, 
      profesorId: e.target.value, 
      estiloId: '' 
    }));
  };

  const handleEstiloChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFilters(prev => ({ 
      ...prev, 
      estiloId: e.target.value 
    }));
    setNewClassData(prev => ({ 
      ...prev, 
      estiloId: e.target.value 
    }));
  };

  const openAttendanceModal = (clase: Clase) => {
    setSelectedClass(clase);
    
    // Inicializar datos de asistencia
    const initialAttendance: AttendanceState = {};
    
    // Para alumnos regulares
    if (clase.asistencias) {
      clase.asistencias.forEach(asistencia => {
        initialAttendance[asistencia.alumnoId] = asistencia.asistio;
      });
    } else {
      // Si no hay asistencias registradas, inicializar todos como presentes
      alumnosDelEstilo.forEach(alumno => {
        initialAttendance[alumno.id] = true;
      });
    }
    
    setAttendanceData(initialAttendance);
    setShowAttendanceModal(true);
  };

  const toggleAttendance = (alumnoId: number) => {
    setAttendanceData(prev => ({
      ...prev,
      [alumnoId]: !prev[alumnoId]
    }));
  };

  const handleNewClassChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewClassData(prev => ({ ...prev, [name]: value }));
  };

  const handleNewStudentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewStudentData(prev => ({ ...prev, [name]: value }));
  };

  const addNewStudent = () => {
    if (!newStudentData.nombre || !newStudentData.apellido || !newStudentData.dni) {
      setMessage({ text: 'Nombre, apellido y DNI son requeridos', type: 'error' });
      return;
    }
    
    setAlumnosSueltos(prev => [...prev, newStudentData]);
    setNewStudentData({
      nombre: '',
      apellido: '',
      dni: '',
      telefono: '',
      email: ''
    });
    setShowNewStudentForm(false);
    setMessage({ text: 'Estudiante suelto agregado con éxito', type: 'success' });
  };

  const createNewClass = async () => {
    if (!newClassData.profesorId || !newClassData.estiloId || !newClassData.fecha || !newClassData.hora) {
      setMessage({ text: 'Todos los campos son requeridos', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.accessToken?.toString();

      if (!token) {
        throw new Error('No se pudo obtener el token de acceso');
      }

      const fechaCompleta = `${newClassData.fecha}T${newClassData.hora}:00`;
      
      const datosClase = {
        profesorId: parseInt(newClassData.profesorId),
        estiloId: parseInt(newClassData.estiloId),
        fecha: fechaCompleta,
        asistencias: [], // Se marcará asistencia después
        alumnosSueltos: []
      };

      const response = await fetch('/api/registrar-clase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(datosClase),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al crear la clase');
      }

      const claseCreada = await response.json();
      
      setMessage({ text: 'Clase creada exitosamente', type: 'success' });
      setShowNewClassModal(false);
      setNewClassData({
        profesorId: '',
        estiloId: '',
        fecha: new Date().toISOString().split('T')[0],
        hora: ''
      });
      
      // Recargar clases
      fetchClasesHistorial();
      
      // Abrir modal de asistencia para la nueva clase
      setTimeout(() => {
        if (newClassData.estiloId) {
          fetchAlumnosEstilo(parseInt(newClassData.estiloId)).then(() => {
            openAttendanceModal(claseCreada.clase);
          });
        }
      }, 500);
      
    } catch (error) {
      console.error('Error:', error);
      setMessage({ 
        text: error instanceof Error ? error.message : 'Error al crear la clase', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const saveAttendance = async () => {
    if (!selectedClass) return;
    
    setLoading(true);
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.accessToken?.toString();

      if (!token) {
        throw new Error('No se pudo obtener el token de acceso');
      }

      const asistencias = Object.entries(attendanceData).map(([alumnoId, asistio]) => ({
        alumnoId: parseInt(alumnoId),
        asistio
      }));

      const datosClase = {
        profesorId: selectedClass.profesorId,
        estiloId: selectedClass.estiloId,
        fecha: selectedClass.fecha,
        asistencias,
        alumnosSueltos
      };

      const response = await fetch('/api/registrar-clase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(datosClase),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al guardar la clase');
      }

      setMessage({ text: 'Asistencia guardada exitosamente', type: 'success' });
      setShowAttendanceModal(false);
      setSelectedClass(null);
      setAlumnosSueltos([]);
      
      // Recargar clases
      fetchClasesHistorial();
    } catch (error) {
      console.error('Error:', error);
      setMessage({ 
        text: error instanceof Error ? error.message : 'Error al guardar la asistencia', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Utilidades
  const getDaysInMonth = () => {
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const days: (Date | null)[] = [];
    
    // Agregar días en blanco del mes anterior
    const startDay = start.getDay();
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    
    // Agregar días del mes actual
    for (let day = 1; day <= end.getDate(); day++) {
      days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
    }
    
    return days;
  };

  const getClassesForDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return clases.filter(clase => clase.fecha.startsWith(dateStr));
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <Container>
      <MainWrapper>
        {/* Header */}
        <Header>
          <HeaderContent>
            <HeaderLeft>
              <IconWrapper>
                <Calendar className="w-6 h-6 text-yellow-600" />
              </IconWrapper>
              <HeaderText>
                <h1>Sistema de Asistencias</h1>
                <p>Gestiona las asistencias de forma moderna y eficiente</p>
              </HeaderText>
            </HeaderLeft>
            
            <ViewToggle>
              <ViewButton 
                active={selectedView === 'calendar'}
                onClick={() => setSelectedView('calendar')}
              >
                <Calendar className="w-4 h-4" />
                Calendario
              </ViewButton>
              <ViewButton 
                active={selectedView === 'list'}
                onClick={() => setSelectedView('list')}
              >
                <BookOpen className="w-4 h-4" />
                Lista
              </ViewButton>
              <ViewButton 
                active={selectedView === 'history'}
                onClick={() => setSelectedView('history')}
              >
                <History className="w-4 h-4" />
                Historial
              </ViewButton>
            </ViewToggle>
          </HeaderContent>
        </Header>

        {/* Mensaje de estado */}
        <AnimatePresence>
          {message && (
            <MessageAlert
              type={message.type}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              {message.text}
            </MessageAlert>
          )}
        </AnimatePresence>

        {/* Filtros */}
        <FiltersCard>
          <FiltersContent>
            <FiltersLeft>
              <Filter className="w-5 h-5 text-gray-500" />
              <Select
                value={selectedFilters.profesorId}
                onChange={handleProfesorChange}
              >
                <option value="">Todos los profesores</option>
                {profesores.map(profesor => (
                  <option key={profesor.id} value={profesor.id}>
                    {profesor.nombre} {profesor.apellido}
                  </option>
                ))}
              </Select>
              
              <Select
                value={selectedFilters.estiloId}
                onChange={handleEstiloChange}
                disabled={!selectedFilters.profesorId}
              >
                <option value="">Todos los estilos</option>
                {estilos.map(estilo => (
                  <option key={estilo.id} value={estilo.id}>
                    {estilo.nombre}
                  </option>
                ))}
              </Select>
            </FiltersLeft>
            
            <PrimaryButton onClick={() => setShowNewClassModal(true)}>
              <Plus className="w-4 h-4" />
              Nueva Clase
            </PrimaryButton>
          </FiltersContent>
        </FiltersCard>

        {/* Vista de Calendario */}
        {selectedView === 'calendar' && (
          <CalendarCard>
            <CalendarHeader>
              <CalendarNav>
                <NavButton
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                >
                  <ChevronLeft className="w-5 h-5" />
                </NavButton>
                
                <MonthTitle>
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </MonthTitle>
                
                <NavButton
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                >
                  <ChevronRight className="w-5 h-5" />
                </NavButton>
              </CalendarNav>
              
              <TodayButton onClick={() => setCurrentDate(new Date())}>
                Hoy
              </TodayButton>
            </CalendarHeader>

            <CalendarGrid>
              {/* Días de la semana */}
              {dayNames.map(day => (
                <WeekdayHeader key={day}>{day}</WeekdayHeader>
              ))}

              {/* Días del mes */}
              {getDaysInMonth().map((day, index) => {
                const dayClasses = day ? getClassesForDay(day) : [];
                const isToday = day ? day.toDateString() === new Date().toDateString() : false;
                const isEmpty = !day;
                
                return (
                  <CalendarDay
                    key={index}
                    hasClasses={dayClasses.length > 0}
                    isToday={isToday}
                    isEmpty={isEmpty}
                  >
                    {day && (
                      <>
                        <DayNumber isToday={isToday}>
                          {day.getDate()}
                        </DayNumber>
                        
                        {dayClasses.map(clase => {
                          const estilo = clase.estilo || estilos.find(e => e.id === clase.estiloId);
                          const profesor = clase.profesor || profesores.find(p => p.id === clase.profesorId);
                          
                          return (
                            <ClassItem
                              key={clase.id}
                              onClick={() => openAttendanceModal(clase)}
                            >
                              <div className="class-title">
                                {estilo?.nombre || 'Clase'}
                              </div>
                              <div className="class-info">
                                <span>{new Date(clase.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                                <Users className="w-3 h-3" />
                              </div>
                            </ClassItem>
                          );
                        })}
                      </>
                    )}
                  </CalendarDay>
                );
              })}
            </CalendarGrid>
          </CalendarCard>
        )}

        {/* Vista de Lista */}
        {selectedView === 'list' && (
          <ListCard>
            <ListHeader>
              <ListTitle>Clases Recientes</ListTitle>
            </ListHeader>
            
            {clases.length === 0 ? (
              <EmptyState>
                <BookOpen className="icon" />
                <h3>No hay clases registradas</h3>
                <p>Crea tu primera clase usando el botón &quot;Nueva Clase&quot;</p>
              </EmptyState>
            ) : (
              clases.slice(0, 10).map(clase => {
                const estilo = clase.estilo || estilos.find(e => e.id === clase.estiloId);
                const profesor = clase.profesor || profesores.find(p => p.id === clase.profesorId);
                const totalAlumnos = (clase.asistencias?.length || 0) + (clase.alumnosSueltos?.length || 0);
                const asistieron = (clase.asistencias?.filter(a => a.asistio).length || 0) + (clase.alumnosSueltos?.length || 0);
                
                return (
                  <ClassListItem
                    key={clase.id}
                    onClick={() => openAttendanceModal(clase)}
                  >
                    <ClassListHeader>
                      <div>
                        <ClassTitle>{estilo?.nombre || 'Clase'}</ClassTitle>
                        <ClassInfo>
                          {profesor?.nombre} {profesor?.apellido} • {new Date(clase.fecha).toLocaleDateString()} • {new Date(clase.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </ClassInfo>
                      </div>
                      <ClassStats>
                        <span>{asistieron}/{totalAlumnos} asistieron</span>
                        <Eye className="w-4 h-4" />
                      </ClassStats>
                    </ClassListHeader>
                  </ClassListItem>
                );
              })
            )}
          </ListCard>
        )}

        {/* Vista de Historial */}
        {selectedView === 'history' && (
          <ListCard>
            <ListHeader>
              <ListTitle>Historial de Asistencias</ListTitle>
            </ListHeader>
            
            {clases.length === 0 ? (
              <EmptyState>
                <History className="icon" />
                <h3>No hay historial disponible</h3>
                <p>Las clases que registres aparecerán aquí</p>
              </EmptyState>
            ) : (
              clases.map(clase => {
                const estilo = clase.estilo || estilos.find(e => e.id === clase.estiloId);
                const profesor = clase.profesor || profesores.find(p => p.id === clase.profesorId);
                const totalAlumnos = (clase.asistencias?.length || 0) + (clase.alumnosSueltos?.length || 0);
                const asistieron = (clase.asistencias?.filter(a => a.asistio).length || 0) + (clase.alumnosSueltos?.length || 0);
                
                return (
                  <ClassListItem
                    key={clase.id}
                    onClick={() => openAttendanceModal(clase)}
                  >
                    <ClassListHeader>
                      <div>
                        <ClassTitle>{estilo?.nombre || 'Clase'}</ClassTitle>
                        <ClassInfo>
                          {profesor?.nombre} {profesor?.apellido} • {new Date(clase.fecha).toLocaleDateString()} • {new Date(clase.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </ClassInfo>
                      </div>
                      <ClassStats>
                        <span>{asistieron}/{totalAlumnos} asistieron</span>
                        <Eye className="w-4 h-4" />
                      </ClassStats>
                    </ClassListHeader>
                  </ClassListItem>
                );
              })
            )}
          </ListCard>
        )}

        {/* Modal Nueva Clase */}
        <AnimatePresence>
          {showNewClassModal && (
            <Modal
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNewClassModal(false)}
            >
              <ModalContent onClick={(e) => e.stopPropagation()}>
                <ModalHeader>
                  <ModalTitle>
                    <h3>Crear Nueva Clase</h3>
                    <p>Programa una nueva clase para tomar asistencia</p>
                  </ModalTitle>
                  <CloseButton onClick={() => setShowNewClassModal(false)}>
                    <X className="w-5 h-5" />
                  </CloseButton>
                </ModalHeader>
                
                <ModalBody>
                  <FormGrid>
                    <FormGroup>
                      <Label>Profesor *</Label>
                      <Select
                        name="profesorId"
                        value={newClassData.profesorId}
                        onChange={handleNewClassChange}
                        required
                      >
                        <option value="">Seleccionar profesor</option>
                        {profesores.map(profesor => (
                          <option key={profesor.id} value={profesor.id}>
                            {profesor.nombre} {profesor.apellido}
                          </option>
                        ))}
                      </Select>
                    </FormGroup>
                    
                    <FormGroup>
                      <Label>Estilo *</Label>
                      <Select
                        name="estiloId"
                        value={newClassData.estiloId}
                        onChange={handleNewClassChange}
                        disabled={!newClassData.profesorId}
                        required
                      >
                        <option value="">Seleccionar estilo</option>
                        {estilos.map(estilo => (
                          <option key={estilo.id} value={estilo.id}>
                            {estilo.nombre}
                          </option>
                        ))}
                      </Select>
                    </FormGroup>
                    
                    <FormGroup>
                      <Label>Fecha *</Label>
                      <Input
                        type="date"
                        name="fecha"
                        value={newClassData.fecha}
                        onChange={handleNewClassChange}
                        required
                      />
                    </FormGroup>
                    
                    <FormGroup>
                      <Label>Hora *</Label>
                      <Input
                        type="time"
                        name="hora"
                        value={newClassData.hora}
                        onChange={handleNewClassChange}
                        required
                      />
                    </FormGroup>
                  </FormGrid>
                </ModalBody>
                
                <ModalFooter>
                  <SecondaryButton onClick={() => setShowNewClassModal(false)}>
                    Cancelar
                  </SecondaryButton>
                  <SaveButton onClick={createNewClass} disabled={loading}>
                    <Plus className="w-4 h-4" />
                    {loading ? 'Creando...' : 'Crear Clase'}
                  </SaveButton>
                </ModalFooter>
              </ModalContent>
            </Modal>
          )}
        </AnimatePresence>

        {/* Modal de Asistencia */}
        <AnimatePresence>
          {showAttendanceModal && selectedClass && (
            <Modal
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAttendanceModal(false)}
            >
              <ModalContent onClick={(e) => e.stopPropagation()}>
                <ModalHeader>
                  <ModalTitle>
                    <h3>
                      Asistencia - {selectedClass.estilo?.nombre || estilos.find(e => e.id === selectedClass.estiloId)?.nombre}
                    </h3>
                    <p>
                      {new Date(selectedClass.fecha).toLocaleDateString()} • {new Date(selectedClass.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </ModalTitle>
                  <CloseButton onClick={() => setShowAttendanceModal(false)}>
                    <X className="w-5 h-5" />
                  </CloseButton>
                </ModalHeader>
                
                <ModalBody>
                  {/* Lista de alumnos regulares */}
                  {alumnosDelEstilo.map(alumno => (
                    <AttendanceItem key={alumno.id}>
                      <div className="student-info">
                        {alumno.nombre} {alumno.apellido}
                      </div>
                      <AttendanceButton
                        present={attendanceData[alumno.id] || false}
                        onClick={() => toggleAttendance(alumno.id)}
                      >
                        {attendanceData[alumno.id] ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                      </AttendanceButton>
                    </AttendanceItem>
                  ))}
                  
                  {/* Alumnos sueltos existentes */}
                  {alumnosSueltos.map((alumno, index) => (
                    <AttendanceItem key={`suelto-${index}`}>
                      <div className="student-info">
                        {alumno.nombre} {alumno.apellido} (Suelto)
                      </div>
                      <AttendanceButton present={true} onClick={() => {}}>
                        <Check className="w-4 h-4" />
                      </AttendanceButton>
                    </AttendanceItem>
                  ))}
                  
                  {/* Agregar estudiante suelto */}
                  {!showNewStudentForm ? (
                    <NewStudentButton onClick={() => setShowNewStudentForm(true)}>
                      <UserPlus className="w-5 h-5" />
                      Agregar Estudiante Suelto
                    </NewStudentButton>
                  ) : (
                    <NewStudentForm>
                      <div className="form-grid">
                        <FormInput
                          type="text"
                          name="nombre"
                          placeholder="Nombre"
                          value={newStudentData.nombre}
                          onChange={handleNewStudentChange}
                        />
                        <FormInput
                          type="text"
                          name="apellido"
                          placeholder="Apellido"
                          value={newStudentData.apellido}
                          onChange={handleNewStudentChange}
                        />
                        <FormInput
                          type="text"
                          name="dni"
                          placeholder="DNI"
                          value={newStudentData.dni}
                          onChange={handleNewStudentChange}
                        />
                        <FormInput
                          type="text"
                          name="telefono"
                          placeholder="Teléfono"
                          value={newStudentData.telefono}
                          onChange={handleNewStudentChange}
                        />
                      </div>
                      <div className="form-actions">
                        <PrimaryButton onClick={addNewStudent}>
                          Agregar
                        </PrimaryButton>
                        <SecondaryButton onClick={() => setShowNewStudentForm(false)}>
                          Cancelar
                        </SecondaryButton>
                      </div>
                    </NewStudentForm>
                  )}
                </ModalBody>
                
                <ModalFooter>
                  <SecondaryButton onClick={() => setShowAttendanceModal(false)}>
                    Cancelar
                  </SecondaryButton>
                  <SaveButton onClick={saveAttendance} disabled={loading}>
                    <Save className="w-4 h-4" />
                    {loading ? 'Guardando...' : 'Guardar Asistencia'}
                  </SaveButton>
                </ModalFooter>
              </ModalContent>
            </Modal>
          )}
        </AnimatePresence>
      </MainWrapper>
    </Container>
  );
};

export default TomarAsistencia;