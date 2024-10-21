import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

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
`;

const Select = styled.select`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Button = styled.button`
  background-color: #FFC001;
  color: #000000;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #e6ac00;
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
`;

const Td = styled.td`
  border-bottom: 1px solid #F9F8F8;
  padding: 12px;
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

const Estilos = () => {
  const [estilos, setEstilos] = useState<Estilo[]>([]);
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [nuevoEstilo, setNuevoEstilo] = useState({
    nombre: '',
    descripcion: '',
    profesorId: '',
    importe: ''
  });
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
      if (!res.ok) {
        throw new Error('Error al obtener estilos');
      }
      const data = await res.json();
      setEstilos(data);
    } catch (error) {
      console.error('Error fetching estilos:', error);
      setMessage({ text: 'Error al cargar estilos. Por favor, intente nuevamente.', isError: true });
    } finally {
      setLoading(false);
    }
  };

  const fetchProfesores = async () => {
    try {
      const res = await fetch('/api/profesores');
      if (!res.ok) {
        throw new Error('Error al obtener profesores');
      }
      const data = await res.json();
      setProfesores(data);
    } catch (error) {
      console.error('Error fetching profesores:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNuevoEstilo(prev => ({
      ...prev,
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
      if (!res.ok) {
        throw new Error('Error al crear estilo');
      }
      const estiloCreado = await res.json();
      setEstilos(prev => [...prev, estiloCreado]);
      setNuevoEstilo({ nombre: '', descripcion: '', profesorId: '', importe: '' });
      setMessage({ text: `Estilo ${estiloCreado.nombre} creado con éxito.`, isError: false });
    } catch (error) {
      console.error('Error creating estilo:', error);
      setMessage({ text: 'Error al crear estilo. Por favor, intente nuevamente.', isError: true });
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
        <Select
          name="profesorId"
          value={nuevoEstilo.profesorId}
          onChange={handleInputChange}
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
          value={nuevoEstilo.importe}
          onChange={handleInputChange}
          placeholder="Importe"
          required
          step="0.01"
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Agregando...' : 'Agregar Estilo'}
        </Button>
      </Form>
      {message && (
        <Message isError={message.isError}>{message.text}</Message>
      )}
      <Table>
        <thead>
        <Tr>
            <Th>Nombre</Th>
            <Th>Descripción</Th>
            <Th>Importe</Th>
            <Th>Profesor Encargado</Th>
          </Tr>
        </thead>
        <tbody>
          {estilos.map((estilo) => (
            <Tr key={estilo.id}>
            <Td>{estilo.nombre}</Td>
            <Td>{estilo.descripcion}</Td>
            <Td>${estilo.importe.toFixed(2)}</Td>
            <Td>{estilo.profesor ? `${estilo.profesor.nombre} ${estilo.profesor.apellido}` : 'No asignado'}</Td>
          </Tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default Estilos;