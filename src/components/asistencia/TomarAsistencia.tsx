// components/Asistencias/index.tsx
import React, { useState, useEffect, useCallback } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { Profesor, Estilo, Alumno } from '@/types';
import { Button } from '../button';

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s ease;
  color: #000000;
  -webkit-text-fill-color: #000000;
  background-color: #FFFFFF;

  &::placeholder {
    color: #666666;
    -webkit-text-fill-color: #666666;
  }

  &:focus {
    border-color: #FFC001;
    outline: none;
    box-shadow: 0 0 0 2px rgba(255, 192, 1, 0.1);
  }

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }

  &:-webkit-autofill,
  &:-webkit-autofill:hover,
  &:-webkit-autofill:focus {
    -webkit-text-fill-color: #000000;
    -webkit-box-shadow: 0 0 0px 1000px white inset;
  }
`;

const SearchInput = styled(Input)`
  margin: 10px 0;
  width: 100%;
  color: #000000;
  -webkit-text-fill-color: #000000;
  background-color: #FFFFFF;
  
  &::placeholder {
    color: #666666;
    -webkit-text-fill-color: #666666;
  }
`;

const ModalContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  color: #000000;
  -webkit-text-fill-color: #000000;

  h3 {
    color: #000000;
    -webkit-text-fill-color: #000000;
  }

  @media (max-width: 768px) {
    width: 95%;
    margin: 10px;
  }
`;

const AlumnoItem = styled.div`
  padding: 10px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  color: #000000;
  -webkit-text-fill-color: #000000;
  background-color: #FFFFFF;
  
  &:hover {
    background: #f5f5f5;
    color: #000000;
    -webkit-text-fill-color: #000000;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
  color: #000000;
  -webkit-text-fill-color: #000000;

  h3 {
    color: #000000;
    -webkit-text-fill-color: #000000;
    margin: 0;
  }
`;

const AlumnosList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  background-color: #FFFFFF;
  border: 1px solid #eee;
  border-radius: 4px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 0 8px;
  color: #666666;
  -webkit-text-fill-color: #666666;
  
  &:hover {
    color: #000000;
    -webkit-text-fill-color: #000000;
  }
`;

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Container = styled.div`
  background-color: #FFFFFF;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

// Section Components
const AlumnosSection = styled.div`
  margin-top: 20px;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
`;

const FormSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
`;

// Typography Components
const Title = styled.h2`
  color: #000000;
  margin-bottom: 30px;
  padding-bottom: 10px;
  border-bottom: 2px solid #FFC001;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 500;
`;

// Group Components
const InputGroup = styled.div`
  flex: 1;
  min-width: 250px;
`;

const SelectGroup = styled(InputGroup)``;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 20px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
`;

// Table Components
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  background-color: white;
`;

const Th = styled.th`
  background-color: #000000;
  color: #FFFFFF;
  text-align: left;
  padding: 15px;
  font-weight: 500;
`;

const Td = styled.td`
  border-bottom: 1px solid #eee;
  padding: 15px;
`;

const Tr = styled.tr`
  &:nth-child(even) {
    background-color: #f9f9f9;
  }

  &:hover {
    background-color: #f5f5f5;
  }
`;

const DeleteButton = styled(Button)`
  background-color: #ff4444;
  color: white;

  &:hover {
    background-color: #cc0000;
  }

  &:disabled {
    background-color: #ffcccc;
  }
`;

// Utility Components
const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  input[type="checkbox"] {
    width: 20px;
    height: 20px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }

    &:checked {
      accent-color: #FFC001;
    }
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ActionIcons = styled.div`
  display: flex;
  gap: 8px;
`;

const IconButton = styled.button<{ color?: string }>`
  padding: 6px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: ${props => 
    props.color === "success" ? "#4caf50" :
    props.color === "danger" ? "#f44336" :
    "#e0e0e0"};
  color: white;
  
  &:hover {
    opacity: 0.8;
  }
`;

const ResponsiveTable = styled.div`
  width: 100%;
  overflow-x: auto;
  
  @media (max-width: 768px) {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
  }
`;

const Card = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    background: white;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }
`;

const CardRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
`;

const Value = styled.span`
  color: #333;
`;

const Icon = styled.span`
  margin-right: 8px;
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background-color: white;
  font-size: 14px;
  transition: border-color 0.3s ease;
  color: #000000;
  -webkit-text-fill-color: #000000;
  
  option {
    color: #000000;
    -webkit-text-fill-color: #000000;
    background-color: #FFFFFF;
  }

  &:focus {
    border-color: #FFC001;
    outline: none;
    box-shadow: 0 0 0 2px rgba(255, 192, 1, 0.1);
  }

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
  margin: 20px 0;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const GlobalStyle = createGlobalStyle`
  @media (max-width: 768px) {
    .desktop-only {
      display: none;
    }
  }
  
  @media (min-width: 769px) {
    .mobile-only {
      display: none;
    }
  }

  /* Estilos específicos para Windows */
  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus,
  input:-webkit-autofill:active {
    -webkit-text-fill-color: #000000 !important;
    -webkit-box-shadow: 0 0 0 30px white inset !important;
  }

  /* Asegurar contraste en campos de texto */
  input, 
  select, 
  textarea {
    color: #000000 !important;
    -webkit-text-fill-color: #000000 !important;
    background-color: #FFFFFF !important;
  }
`;

const Message = styled.div<{ type: 'success' | 'error' }>`
  margin-top: 20px;
  padding: 15px;
  border-radius: 6px;
  background-color: ${props => props.type === 'success' ? '#e8f5e9' : '#ffebee'};
  color: ${props => props.type === 'success' ? '#2e7d32' : '#c62828'};
  border-left: 4px solid ${props => props.type === 'success' ? '#2e7d32' : '#c62828'};
  font-size: 14px;
  line-height: 1.5;
`;

interface SearchableAlumno extends Alumno {
  searchText?: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (alumno: Alumno) => void;
  alumnos: SearchableAlumno[];
}

// Interfaces actualizadas
interface AlumnoConAsistencia extends Alumno {
  asistio: boolean;
}

interface AlumnoSuelto {
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  email: string;
}

const TomarAsistencia: React.FC = () => {
  // Estados
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [estilos, setEstilos] = useState<Estilo[]>([]);
  const [alumnosDelEstilo, setAlumnosDelEstilo] = useState<Alumno[]>([]);
  const [profesorSeleccionado, setProfesorSeleccionado] = useState('');
  const [estiloSeleccionado, setEstiloSeleccionado] = useState('');
  const [alumnosSeleccionados, setAlumnosSeleccionados] = useState<AlumnoConAsistencia[]>([]);
  const [alumnosSueltos, setAlumnosSueltos] = useState<AlumnoSuelto[]>([]);
  const [mostrarFormularioSuelto, setMostrarFormularioSuelto] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [todosLosAlumnos, setTodosLosAlumnos] = useState<Alumno[]>([]);
  const [nuevoAlumnoSuelto, setNuevoAlumnoSuelto] = useState<AlumnoSuelto>({
    nombre: '',
    apellido: '',
    dni: '',
    telefono: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Efectos
  useEffect(() => {
    fetchProfesores();
  }, []);

  useEffect(() => {
    if (profesorSeleccionado) {
      fetchEstilosProfesor(parseInt(profesorSeleccionado));
    } else {
      setEstilos([]);
      setEstiloSeleccionado('');
    }
  }, [profesorSeleccionado]);

  useEffect(() => {
    if (estiloSeleccionado) {
      fetchAlumnosEstilo(parseInt(estiloSeleccionado));
    } else {
      setAlumnosDelEstilo([]);
      setAlumnosSeleccionados([]);
    }
  }, [estiloSeleccionado]);

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
      // Inicializar todos los alumnos con asistencia
      setAlumnosSeleccionados(data.map((alumno: any) => ({ ...alumno, asistio: true })));
    } catch (error) {
      console.error('Error:', error);
      setMessage({ text: 'Error al cargar alumnos', type: 'error' });
    }
  };

  const fetchTodosLosAlumnos = async () => {
    try {
      const res = await fetch('/api/alumnos');
      if (!res.ok) throw new Error('Error al obtener alumnos');
      const data = await res.json();
      setTodosLosAlumnos(data);
    } catch (error) {
      console.error('Error:', error);
      setMessage({ text: 'Error al cargar alumnos', type: 'error' });
    }
  };
  
  // Add to useEffect
  useEffect(() => {
    fetchTodosLosAlumnos();
  }, []);

  // Handlers
  const handleProfesorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setProfesorSeleccionado(e.target.value);
    setEstiloSeleccionado('');
    setAlumnosSeleccionados([]);
    setAlumnosSueltos([]);
  };

  const handleEstiloChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEstiloSeleccionado(e.target.value);
    setAlumnosSeleccionados([]);
    setAlumnosSueltos([]);
  };

  const handleAsistenciaChange = (alumnoId: number, asistio: boolean) => {
    setAlumnosSeleccionados(prev => prev.map(alumno => 
      alumno.id === alumnoId ? { ...alumno, asistio } : alumno
    ));
  };

  const handleNuevoAlumnoSueltoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNuevoAlumnoSuelto(prev => ({ ...prev, [name]: value }));
  };

  const handleAgregarAlumnoSuelto = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!nuevoAlumnoSuelto.nombre || !nuevoAlumnoSuelto.apellido || !nuevoAlumnoSuelto.dni) {
      setMessage({ text: 'Nombre, apellido y DNI son requeridos', type: 'error' });
      return;
    }
    setAlumnosSueltos(prev => [...prev, nuevoAlumnoSuelto]);
    setNuevoAlumnoSuelto({
      nombre: '',
      apellido: '',
      dni: '',
      telefono: '',
      email: ''
    });
    setMostrarFormularioSuelto(false);
  };

  const handleRemoveAlumno = (id: number) => {
    setAlumnosSeleccionados(prev => prev.filter(alumno => alumno.id !== id));
  };

  const handleRemoveAlumnoSuelto = (index: number) => {
    setAlumnosSueltos(prev => prev.filter((_, i) => i !== index));
  };

  const handleFinalizarClase = async () => {
    if (!profesorSeleccionado || !estiloSeleccionado) {
      setMessage({ text: 'Seleccione profesor y estilo', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const datosClase = {
        profesorId: parseInt(profesorSeleccionado),
        estiloId: parseInt(estiloSeleccionado),
        fecha: new Date().toISOString(),
        asistencias: alumnosSeleccionados.map(({ id, asistio }) => ({ 
          alumnoId: id, 
          asistio 
        })),
        alumnosSueltos
      };

      const response = await fetch('/api/registrar-clase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosClase),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al guardar la clase');
      }

      setMessage({ text: 'Clase registrada exitosamente', type: 'success' });
      resetForm();
    } catch (error) {
      console.error('Error:', error);
      setMessage({ 
        text: error instanceof Error ? error.message : 'Error al registrar la clase', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setProfesorSeleccionado('');
    setEstiloSeleccionado('');
    setAlumnosSeleccionados([]);
    setAlumnosSueltos([]);
    setMostrarFormularioSuelto(false);
  };

  const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onSelect, alumnos }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredAlumnos, setFilteredAlumnos] = useState<SearchableAlumno[]>([]);
  
    useEffect(() => {
      const filtered = alumnos.filter(alumno => 
        `${alumno.nombre} ${alumno.apellido} ${alumno.dni}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
      setFilteredAlumnos(filtered);
    }, [searchTerm, alumnos]);
  
    if (!isOpen) return null;
  
    return (
      <ModalOverlay>
        <ModalContent>
          <ModalHeader>
            <h3>Buscar Alumno Regular</h3>
            <CloseButton onClick={onClose}>&times;</CloseButton>
          </ModalHeader>
          <SearchInput
            type="text"
            placeholder="Buscar por nombre, apellido o DNI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
          <AlumnosList>
            {filteredAlumnos.map(alumno => (
              <AlumnoItem
                key={alumno.id}
                onClick={() => {
                  onSelect(alumno);
                  onClose();
                }}
              >
                {alumno.nombre} {alumno.apellido} - DNI: {alumno.dni}
              </AlumnoItem>
            ))}
          </AlumnosList>
        </ModalContent>
      </ModalOverlay>
    );
  };

  return (
    <>
  <GlobalStyle />
    <PageContainer>
      <Container>
        <Title>Registro de Asistencia</Title>

        <FormSection>
          <SelectGroup>
            <Label>Profesor:</Label>
            <Select 
              value={profesorSeleccionado} 
              onChange={handleProfesorChange}
            >
              <option value="">Seleccione un profesor</option>
              {profesores.map(profesor => (
                <option key={profesor.id} value={profesor.id}>
                  {profesor.nombre} {profesor.apellido}
                </option>
              ))}
            </Select>
          </SelectGroup>

          <SelectGroup>
            <Label>Estilo:</Label>
            <Select 
              value={estiloSeleccionado} 
              onChange={handleEstiloChange}
              disabled={!profesorSeleccionado}
            >
              <option value="">Seleccione un estilo</option>
              {estilos.map(estilo => (
                <option key={estilo.id} value={estilo.id}>
                  {estilo.nombre}
                </option>
              ))}
            </Select>
          </SelectGroup>
        </FormSection>
        {estiloSeleccionado && (
          <AlumnosSection>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3>Alumnos del Estilo</h3>
              <ActionButtons>
  <Button onClick={() => setMostrarFormularioSuelto(true)}>
    <Icon>+</Icon> Alumno Suelto
  </Button>
  <Button onClick={() => setShowSearchModal(true)}>
    <Icon>🔍</Icon> Buscar Alumno Regular
  </Button>
</ActionButtons>

<SearchModal
  isOpen={showSearchModal}
  onClose={() => setShowSearchModal(false)}
  onSelect={(alumno) => {
    if (!alumnosSeleccionados.find(a => a.id === alumno.id)) {
      setAlumnosSeleccionados(prev => [...prev, { ...alumno, asistio: true }]);
    }
  }}
  alumnos={todosLosAlumnos}
/>
            </div>

            {mostrarFormularioSuelto && (
              <FormSection>
                <Title>Nuevo Alumno Suelto</Title>
                <InputGroup>
                  <Label>Nombre:</Label>
                  <Input
                    type="text"
                    name="nombre"
                    value={nuevoAlumnoSuelto.nombre}
                    onChange={handleNuevoAlumnoSueltoChange}
                    placeholder="Nombre"
                    required
                  />
                </InputGroup>

                <InputGroup>
                  <Label>Apellido:</Label>
                  <Input
                    type="text"
                    name="apellido"
                    value={nuevoAlumnoSuelto.apellido}
                    onChange={handleNuevoAlumnoSueltoChange}
                    placeholder="Apellido"
                    required
                  />
                </InputGroup>

                <InputGroup>
                  <Label>DNI:</Label>
                  <Input
                    type="text"
                    name="dni"
                    value={nuevoAlumnoSuelto.dni}
                    onChange={handleNuevoAlumnoSueltoChange}
                    placeholder="DNI"
                    required
                  />
                </InputGroup>

                <InputGroup>
                  <Label>Teléfono:</Label>
                  <Input
                    type="tel"
                    name="telefono"
                    value={nuevoAlumnoSuelto.telefono}
                    onChange={handleNuevoAlumnoSueltoChange}
                    placeholder="Teléfono"
                    required
                  />
                </InputGroup>

                <InputGroup>
                  <Label>Email:</Label>
                  <Input
                    type="email"
                    name="email"
                    value={nuevoAlumnoSuelto.email}
                    onChange={handleNuevoAlumnoSueltoChange}
                    placeholder="Email"
                  />
                </InputGroup>

                <ButtonGroup>
                  <Button 
                    type="button" 
                    onClick={handleAgregarAlumnoSuelto}
                    disabled={loading}
                  >
                    Agregar
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => setMostrarFormularioSuelto(false)}
                  >
                    Cancelar
                  </Button>
                </ButtonGroup>
              </FormSection>
            )}

            {/* Tabla de Asistencias */}
            {(alumnosSeleccionados.length > 0 || alumnosSueltos.length > 0) && (
  <ResponsiveTable>
  {/* Desktop View */}
  <Table className="desktop-only">
                <thead>
                  <tr>
                    <Th>Nombre</Th>
                    <Th>Apellido</Th>
                    <Th>Tipo</Th>
                    <Th>Asistió</Th>
                    <Th>Acciones</Th>
                  </tr>
                </thead>
                <tbody>
                  {alumnosSeleccionados.map(alumno => (
                    <Tr key={alumno.id}>
                      <Td>{alumno.nombre}</Td>
                      <Td>{alumno.apellido}</Td>
                      <Td>Regular</Td>
                      <Td>
  <ActionIcons>
    <IconButton 
      onClick={() => handleAsistenciaChange(alumno.id, !alumno.asistio)}
      color={alumno.asistio ? "success" : "default"}
    >
      {alumno.asistio ? "✓" : "✗"}
    </IconButton>
    <IconButton 
      onClick={() => handleRemoveAlumno(alumno.id)}
      color="danger"
    >
      🗑️
    </IconButton>
  </ActionIcons>
</Td>
                    </Tr>
                  ))}
                  {alumnosSueltos.map((alumno, index) => (
                    <Tr key={`suelto-${index}`}>
                      <Td>{alumno.nombre}</Td>
                      <Td>{alumno.apellido}</Td>
                      <Td>Suelto</Td>
                      <Td>
                        <CheckboxWrapper>
                          <input
                            type="checkbox"
                            checked={true}
                            disabled
                          />
                        </CheckboxWrapper>
                      </Td>
                      <Td>
                        <DeleteButton 
                          onClick={() => handleRemoveAlumnoSuelto(index)}
                          disabled={loading}
                        >
                          Eliminar
                        </DeleteButton>
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>

                  {/* Mobile View */}
    <div className="mobile-only">
      {alumnosSeleccionados.map(alumno => (
        <Card key={alumno.id}>
          <CardRow>
            <Label>Nombre:</Label>
            <Value>{alumno.nombre}</Value>
          </CardRow>
          <CardRow>
            <Label>Apellido:</Label>
            <Value>{alumno.apellido}</Value>
          </CardRow>
          <CardRow>
            <Label>Tipo:</Label>
            <Value>Regular</Value>
          </CardRow>
          <CardRow>
            <Label>Asistió:</Label>
            <CheckboxWrapper>
              <input
                type="checkbox"
                checked={alumno.asistio}
                onChange={(e) => handleAsistenciaChange(alumno.id, e.target.checked)}
                disabled={loading}
              />
            </CheckboxWrapper>
          </CardRow>
          <CardRow>
            <Label>Acciones:</Label>
            <ActionIcons>
              <IconButton 
                onClick={() => handleRemoveAlumno(alumno.id)}
                color="danger"
              >
                Eliminar
              </IconButton>
            </ActionIcons>
          </CardRow>
        </Card>
      ))}
      {alumnosSueltos.map((alumno, index) => (
        <Card key={`suelto-${index}`}>
          <CardRow>
            <Label>Nombre:</Label>
            <Value>{alumno.nombre}</Value>
          </CardRow>
          <CardRow>
            <Label>Apellido:</Label>
            <Value>{alumno.apellido}</Value>
          </CardRow>
          <CardRow>
            <Label>Tipo:</Label>
            <Value>Suelto</Value>
          </CardRow>
          <CardRow>
            <Label>Asistió:</Label>
            <CheckboxWrapper>
              <input
                type="checkbox"
                checked={true}
                disabled
              />
            </CheckboxWrapper>
          </CardRow>
          <CardRow>
            <Label>Acciones:</Label>
            <ActionIcons>
              <IconButton 
                onClick={() => handleRemoveAlumnoSuelto(index)}
                color="danger"
              >
                Eliminar
              </IconButton>
            </ActionIcons>
          </CardRow>
        </Card>
      ))}
    </div>
  </ResponsiveTable>
)}

            {/* Botón Finalizar Clase */}
            {(alumnosSeleccionados.length > 0 || alumnosSueltos.length > 0) && (
              <ButtonContainer>
                <Button 
                  onClick={handleFinalizarClase}
                  disabled={loading}
                  style={{ marginTop: '20px' }}
                >
                  {loading ? 'Guardando...' : 'Finalizar Clase'}
                </Button>
              </ButtonContainer>
            )}
          </AlumnosSection>
        )}

        {/* Mensajes de estado */}
        {message && (
          <Message type={message.type}>
            {message.text}
          </Message>
        )}
      </Container>
    </PageContainer>
    </>
  );
};



export default TomarAsistencia;