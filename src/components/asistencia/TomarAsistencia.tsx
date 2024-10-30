// components/Asistencias/index.tsx
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Profesor, Estilo, Alumno } from '@/types';
import { Button } from '../button';


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

// Form Components
const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s ease;

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

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background-color: white;
  font-size: 14px;
  transition: border-color 0.3s ease;
  
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

  return (
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
              <Button 
                type="button" 
                onClick={() => setMostrarFormularioSuelto(true)}
                disabled={loading}
              >
                Agregar Alumno Suelto
              </Button>
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
              <Table>
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
                        <CheckboxWrapper>
                          <input
                            type="checkbox"
                            checked={alumno.asistio}
                            onChange={(e) => handleAsistenciaChange(alumno.id, e.target.checked)}
                            disabled={loading}
                          />
                        </CheckboxWrapper>
                      </Td>
                      <Td>
                        <DeleteButton 
                          onClick={() => handleRemoveAlumno(alumno.id)}
                          disabled={loading}
                        >
                          Eliminar
                        </DeleteButton>
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
  );
};


export default TomarAsistencia;