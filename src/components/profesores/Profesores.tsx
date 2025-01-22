import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Profesor, Estilo } from '@/types';

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

const Title = styled.h2`
  color: #000000;
  margin-bottom: 30px;
  padding-bottom: 10px;
  border-bottom: 2px solid #FFC001;
`;

const ScrollableContainer = styled.div`
  max-height: 600px;
  overflow-y: auto;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #eee;
`;

const SectionTitle = styled.h3`
  width: 100%;
  color: #333;
  margin-bottom: 10px;
  font-size: 1.1em;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 250px;
`;

const Label = styled.label`
  margin-bottom: 8px;
  color: #555;
  font-weight: 500;
`;

const Input = styled.input`
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s ease;

  &:focus {
    border-color: #FFC001;
    box-shadow: 0 0 0 2px rgba(255, 192, 1, 0.2);
    outline: none;
  }

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background-color: white;
  transition: all 0.3s ease;
  
  &:focus {
    border-color: #FFC001;
    box-shadow: 0 0 0 2px rgba(255, 192, 1, 0.2);
    outline: none;
  }

  &[multiple] {
    height: 120px;
  }
`;

const Button = styled.button`
  background-color: #FFC001;
  color: #000000;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    background-color: #e6ac00;
    transform: translateY(-1px);
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
    transform: none;
  }
`;

const DeleteButton = styled(Button)`
  background-color: #ff4444;
  color: white;

  &:hover {
    background-color: #cc0000;
  }
`;

const ToggleButton = styled(Button)`
  background-color: #4CAF50;
  color: white;
  margin-bottom: 20px;

  &:hover {
    background-color: #45a049;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
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

const Message = styled.div<{ isError?: boolean }>`
  margin: 20px 0;
  padding: 15px;
  border-radius: 6px;
  background-color: ${props => props.isError ? '#ffebee' : '#e8f5e9'};
  color: ${props => props.isError ? '#c62828' : '#2e7d32'};
  border-left: 4px solid ${props => props.isError ? '#c62828' : '#2e7d32'};
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px;
  margin-bottom: 20px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s ease;
  &:focus {
    border-color: #FFC001;
    outline: none;
    box-shadow: 0 0 0 2px rgba(255, 192, 1, 0.1);
  }
`;

const ProfesoresList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin-bottom: 20px;
  border: 1px solid #eee;
  border-radius: 6px;
  max-height: 300px;
  overflow-y: auto;
`;

const ProfesorItem = styled.li`
  padding: 12px 15px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: all 0.2s ease;
  &:last-child {
    border-bottom: none;
  }
  &:hover {
    background-color: #f5f5f5;
  }
`;

interface ProfesorForm {
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  telefono: string;
  fechaNacimiento: string;
  direccion: string;
  cuit: string;
  porcentajePorDefecto: string;
  porcentajeClasesSueltasPorDefecto: string;
  estilosIds: number[];
}

const Profesores = () => {
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [estilos, setEstilos] = useState<Estilo[]>([]);
  const [mostrarListado, setMostrarListado] = useState(true);
  const [nuevoProfesor, setNuevoProfesor] = useState<ProfesorForm>({
    nombre: '',
    apellido: '',
    dni: '',
    email: '',
    telefono: '',
    fechaNacimiento: '',
    direccion: '',
    cuit: '',
    porcentajePorDefecto: '60',
    porcentajeClasesSueltasPorDefecto: '80',
    estilosIds: []
  });
  
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  useEffect(() => {
    fetchProfesores();
    fetchEstilos();
  }, []);

  const fetchProfesores = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/profesores');
      if (!res.ok) throw new Error('Error al obtener profesores');
      const data = await res.json();
      setProfesores(data);
      setMessage({ text: `Se cargaron ${data.length} profesores correctamente.`, isError: false });
    } catch (error) {
      console.error('Error fetching profesores:', error);
      setMessage({ text: 'Error al cargar profesores. Por favor, intente nuevamente.', isError: true });
    } finally {
      setLoading(false);
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (name === 'estilosIds' && (e.target as HTMLSelectElement).multiple) {
      const selectedOptions = Array.from(
        (e.target as HTMLSelectElement).selectedOptions,
        option => parseInt(option.value)
      );
      setNuevoProfesor(prev => ({ ...prev, [name]: selectedOptions }));
    } else {
      setNuevoProfesor(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/profesores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoProfesor),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al crear profesor');
      }

      const profesorCreado = await res.json();
      setProfesores(prev => [...prev, profesorCreado]);
      resetForm();
      setMessage({ 
        text: `Profesor ${profesorCreado.nombre} ${profesorCreado.apellido} creado con éxito.`, 
        isError: false 
      });
    } catch (error) {
      console.error('Error:', error);
      setMessage({ 
        text: error instanceof Error ? error.message : 'Error al crear profesor', 
        isError: true 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (profesorId: number) => {
    if (!confirm('¿Está seguro que desea eliminar este profesor?')) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/profesores?id=${profesorId}`, {
        method: 'DELETE'
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error);
      }

      setProfesores(prev => prev.filter(p => p.id !== profesorId));
      setMessage({ text: 'Profesor eliminado exitosamente', isError: false });
    } catch (error) {
      console.error('Error:', error);
      setMessage({ 
        text: error instanceof Error ? error.message : 'Error al eliminar profesor', 
        isError: true 
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNuevoProfesor({
      nombre: '',
      apellido: '',
      dni: '',
      email: '',
      telefono: '',
      fechaNacimiento: '',
      direccion: '',
      cuit: '',
      porcentajePorDefecto: '60',
      porcentajeClasesSueltasPorDefecto: '80',
      estilosIds: []
    });
  };

  return (
    <PageContainer>
      <Container>
        <Title>Gestión de Profesores</Title>

        <ScrollableContainer>
          <Form onSubmit={handleSubmit}>
            <FormSection>
              <SectionTitle>Información Personal</SectionTitle>
              <InputGroup>
                <Label>Nombre:</Label>
                <Input
                  type="text"
                  name="nombre"
                  value={nuevoProfesor.nombre}
                  onChange={handleInputChange}
                  required
                  placeholder="Ingrese nombre"
                />
              </InputGroup>

              <InputGroup>
                <Label>Apellido:</Label>
                <Input
                  type="text"
                  name="apellido"
                  value={nuevoProfesor.apellido}
                  onChange={handleInputChange}
                  required
                  placeholder="Ingrese apellido"
                />
              </InputGroup>

              <InputGroup>
                <Label>DNI:</Label>
                <Input
                  type="text"
                  name="dni"
                  value={nuevoProfesor.dni}
                  onChange={handleInputChange}
                  required
                  placeholder="Ingrese DNI"
                />
              </InputGroup>
            </FormSection>

            <FormSection>
              <SectionTitle>Información de Contacto</SectionTitle>
              <InputGroup>
                <Label>Email:</Label>
                <Input
                  type="email"
                  name="email"
                  value={nuevoProfesor.email}
                  onChange={handleInputChange}
                  placeholder="Ingrese email"
                />
              </InputGroup>

              <InputGroup>
                <Label>Teléfono:</Label>
                <Input
                  type="tel"
                  name="telefono"
                  value={nuevoProfesor.telefono}
                  onChange={handleInputChange}
                  placeholder="Ingrese teléfono"
                />
              </InputGroup>

              <InputGroup>
                <Label>Dirección:</Label>
                <Input
                  type="text"
                  name="direccion"
                  value={nuevoProfesor.direccion}
                  onChange={handleInputChange}
                  placeholder="Ingrese dirección"
                />
              </InputGroup>
            </FormSection>

            <FormSection>
              <SectionTitle>Información Adicional</SectionTitle>
              <InputGroup>
                <Label>Fecha de Nacimiento:</Label>
                <Input
                  type="date"
                  name="fechaNacimiento"
                  value={nuevoProfesor.fechaNacimiento}
                  onChange={handleInputChange}
                />
              </InputGroup>

              <InputGroup>
                <Label>CUIT:</Label>
                <Input
                  type="text"
                  name="cuit"
                  value={nuevoProfesor.cuit}
                  onChange={handleInputChange}
                  placeholder="Ingrese CUIT"
                />
              </InputGroup>
            </FormSection>

            <FormSection>
              <SectionTitle>Información Profesional</SectionTitle>
              <InputGroup>
                <Label>Porcentaje por Cursos (%):</Label>
                <Input
                  type="number"
                  name="porcentajePorDefecto"
                  value={nuevoProfesor.porcentajePorDefecto}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                />
              </InputGroup>

              <InputGroup>
                <Label>Porcentaje por Clases Sueltas (%):</Label>
                <Input
                  type="number"
                  name="porcentajeClasesSueltasPorDefecto"
                  value={nuevoProfesor.porcentajeClasesSueltasPorDefecto}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                />
              </InputGroup>

              <InputGroup>
                <Label>Estilos que dicta:</Label>
                <Select
                  multiple
                  name="estilosIds"
                  value={nuevoProfesor.estilosIds.map(String)}
                  onChange={handleInputChange}
                >
                  {estilos.map(estilo => (
                    <option key={estilo.id} value={estilo.id}>
                      {estilo.nombre}
                    </option>
                  ))}
                </Select>
              </InputGroup>
            </FormSection>

            <Button type="submit" disabled={loading}>
              {loading ? 'Agregando...' : 'Agregar Profesor'}
            </Button>
          </Form>
        </ScrollableContainer>

        <ToggleButton onClick={() => setMostrarListado(!mostrarListado)}>
          {mostrarListado ? 'Ocultar Listado' : 'Mostrar Listado'}
        </ToggleButton>

        {message && (
          <Message isError={message.isError}>{message.text}</Message>
        )}

        {mostrarListado && (
          <ScrollableContainer>
            <Table>
              <thead>
                <Tr>
                  <Th>Nombre</Th>
                  <Th>Apellido</Th>
                  <Th>DNI</Th>
                  <Th>Email</Th>
                  <Th>Teléfono</Th>
                  <Th>CUIT</Th>
                  <Th>Estilos</Th>
                  <Th>% Cursos</Th>
                  <Th>% Clases</Th>
                  <Th>Acciones</Th>
                </Tr>
              </thead>
              <tbody>
                {profesores.map((profesor) => (
                  <Tr key={profesor.id}>
                    <Td>{profesor.nombre}</Td>
                    <Td>{profesor.apellido}</Td>
                    <Td>{profesor.dni}</Td>
                    <Td>{profesor.email}</Td>
                    <Td>{profesor.telefono}</Td>
                    <Td>{profesor.cuit}</Td>
                    <Td>{profesor.porcentajePorDefecto}%</Td>
                    <Td>{profesor.porcentajeClasesSueltasPorDefecto}%</Td>
                    <Td>
                      <DeleteButton 
                        onClick={() => handleDelete(profesor.id)}
                        disabled={loading}
                      >
                        Eliminar
                      </DeleteButton>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </ScrollableContainer>
        )}
      </Container>
    </PageContainer>
  );
};

export default Profesores;