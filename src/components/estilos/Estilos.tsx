import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

// Styled Components
const Container = styled.div`
  background-color: #FFFFFF;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const Title = styled.h2`
  color: #000000;
  margin-bottom: 20px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 30px;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #FFC001;
    box-shadow: 0 0 0 2px rgba(255, 192, 1, 0.2);
  }
`;

const Select = styled.select`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #FFC001;
    box-shadow: 0 0 0 2px rgba(255, 192, 1, 0.2);
  }
`;

const Button = styled.button`
  background-color: #FFC001;
  color: #000000;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  
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

const ActionButton = styled(Button)`
  padding: 8px 16px;
  font-size: 0.9em;
  
  &.edit {
    background-color: #4CAF50;
    color: white;
    
    &:hover {
      background-color: #45a049;
    }
  }
  
  &.delete {
    background-color: #f44336;
    color: white;
    
    &:hover {
      background-color: #da190b;
    }
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
  font-weight: 500;
`;

const Td = styled.td`
  border-bottom: 1px solid #F9F8F8;
  padding: 12px;
`;

const Tr = styled.tr`
  &:nth-child(even) {
    background-color: #F9F8F8;
  }

  &:hover {
    background-color: #f5f5f5;
  }
`;

const Message = styled.div<{ isError?: boolean }>`
  margin-top: 20px;
  padding: 10px;
  border-radius: 4px;
  background-color: ${props => props.isError ? '#ffebee' : '#e8f5e9'};
  color: ${props => props.isError ? '#c62828' : '#2e7d32'};
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: "${props => props.isError ? '❌' : '✅'}";
  }
`;

const Modal = styled.div`
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
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
`;

const ModalTitle = styled.h3`
  margin-bottom: 20px;
  color: #000000;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
`;

// Interfaces
interface Estilo {
  id: number;
  nombre: string;
  descripcion?: string;
  importe: number;
  profesor?: {
    id: number;
    nombre: string;
    apellido: string;
  };
}

interface Profesor {
  id: number;
  nombre: string;
  apellido: string;
}

interface EstiloEdicion {
  id: number;
  nombre: string;
  descripcion: string;
  importe: number;
  profesorId?: number;
}

const Estilos: React.FC = () => {
  const [estilos, setEstilos] = useState<Estilo[]>([]);
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [nuevoEstilo, setNuevoEstilo] = useState({
    nombre: '',
    descripcion: '',
    profesorId: '',
    importe: ''
  });
  const [estiloEnEdicion, setEstiloEnEdicion] = useState<EstiloEdicion | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  useEffect(() => {
    fetchEstilos();
    fetchProfesores();
  }, []);

  const fetchEstilos = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/estilos');
      if (!res.ok) throw new Error('Error al obtener estilos');
      const data = await res.json();
      setEstilos(data);
    } catch (error) {
      console.error('Error fetching estilos:', error);
      setMessage({ text: 'Error al cargar estilos', isError: true });
    } finally {
      setLoading(false);
    }
  };

  const fetchProfesores = async () => {
    try {
      const res = await fetch('/api/profesores');
      if (!res.ok) throw new Error('Error al obtener profesores');
      const data = await res.json();
      setProfesores(data);
    } catch (error) {
      console.error('Error fetching profesores:', error);
      setMessage({ text: 'Error al cargar profesores', isError: true });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNuevoEstilo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEdicionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!estiloEnEdicion) return;
    const { name, value } = e.target;
    setEstiloEnEdicion(prev => ({
      ...prev!,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/estilos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoEstilo),
      });
      if (!res.ok) throw new Error('Error al crear estilo');
      
      await fetchEstilos();
      setNuevoEstilo({ nombre: '', descripcion: '', profesorId: '', importe: '' });
      setMessage({ text: 'Estilo creado exitosamente', isError: false });
    } catch (error) {
      console.error('Error:', error);
      setMessage({ text: 'Error al crear estilo', isError: true });
    } finally {
      setLoading(false);
    }
  };

  const handleEditar = (estilo: Estilo) => {
    setEstiloEnEdicion({
      id: estilo.id,
      nombre: estilo.nombre,
      descripcion: estilo.descripcion || '',
      importe: estilo.importe,
      profesorId: estilo.profesor?.id
    });
  };

  const handleGuardarEdicion = async () => {
    if (!estiloEnEdicion) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/estilos/${estiloEnEdicion.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(estiloEnEdicion),
      });

      if (!res.ok) throw new Error('Error al actualizar estilo');

      await fetchEstilos();
      setEstiloEnEdicion(null);
      setMessage({ text: 'Estilo actualizado exitosamente', isError: false });
    } catch (error) {
      console.error('Error:', error);
      setMessage({ text: 'Error al actualizar estilo', isError: true });
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id: number) => {
    if (!confirm('¿Está seguro que desea eliminar este estilo?')) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/estilos/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al eliminar estilo');
      }

      await fetchEstilos();
      setMessage({ text: 'Estilo eliminado exitosamente', isError: false });
    } catch (error: any) {
      console.error('Error:', error);
      setMessage({ text: error.message || 'Error al eliminar estilo', isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Title>Estilos</Title>

      <Form onSubmit={handleSubmit}>
        <Input
          type="text"
          name="nombre"
          value={nuevoEstilo.nombre}
          onChange={handleInputChange}
          placeholder="Nombre"
          required
        />
        <Input
          type="text"
          name="descripcion"
          value={nuevoEstilo.descripcion}
          onChange={handleInputChange}
          placeholder="Descripción"
        />
        <Input
          type="number"
          name="importe"
          value={nuevoEstilo.importe}
          onChange={handleInputChange}
          placeholder="Importe"
          required
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Agregando...' : 'Agregar Estilo'}
        </Button>
      </Form>

      {message && (
        <Message isError={message.isError}>
          {message.text}
        </Message>
      )}

      <Table>
        <thead>
          <Tr>
            <Th>Nombre</Th>
            <Th>Descripción</Th>
            <Th>Importe</Th>
            <Th>Profesor Encargado</Th>
            <Th>Acciones</Th>
          </Tr>
        </thead>
        <tbody>
          {estilos.map((estilo) => (
            <Tr key={estilo.id}>
              <Td>{estilo.nombre}</Td>
              <Td>{estilo.descripcion}</Td>
              <Td>${estilo.importe.toFixed(0)}</Td>
              <Td>
                {estilo.profesor 
                  ? `${estilo.profesor.nombre} ${estilo.profesor.apellido}` 
                  : 'No asignado'}
              </Td>
              <Td>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <ActionButton
                    type="button"
                    className="edit"
                    onClick={() => handleEditar(estilo)}
                  >
                    Editar
                  </ActionButton>
                  <ActionButton
                    type="button"
                    className="delete"
                    onClick={() => handleEliminar(estilo.id)}
                  >
                    Eliminar
                  </ActionButton>
                </div>
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>

      {estiloEnEdicion && (
        <Modal>
          <ModalContent>
            <ModalTitle>Editar Estilo</ModalTitle>
            <Form onSubmit={(e) => {
              e.preventDefault();
              handleGuardarEdicion();
            }}>
              <Input
                type="text"
                name="nombre"
                value={estiloEnEdicion.nombre}
                onChange={handleEdicionChange}
                placeholder="Nombre"
                required
              />
              <Input
                type="text"
                name="descripcion"
                value={estiloEnEdicion.descripcion}
                onChange={handleEdicionChange}
                placeholder="Descripción"
              />
              <Select
                name="profesorId"
                value={estiloEnEdicion.profesorId || ''}
                onChange={handleEdicionChange}
              >
                <option value="">Seleccione un profesor (opcional)</option>
                {profesores.map((profesor) => (
                  <option key={profesor.id} value={profesor.id}>
                    {profesor.nombre} {profesor.apellido}
                  </option>
                ))}
              </Select>
              <Input
                type="number"
                name="importe"
                value={estiloEnEdicion.importe}
                onChange={handleEdicionChange}
                placeholder="Importe"
                required
              />
              <ButtonGroup>
                <Button
                  type="button"
                  onClick={() => setEstiloEnEdicion(null)}
                  style={{ backgroundColor: '#cccccc' }}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </ButtonGroup>
            </Form>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default Estilos;