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

interface Profesor {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  email?: string;
}

const Profesores = () => {
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [nuevoProfesor, setNuevoProfesor] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  useEffect(() => {
    fetchProfesores();
  }, []);

  const fetchProfesores = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/profesores');
      if (!res.ok) {
        throw new Error('Error al obtener profesores');
      }
      const data = await res.json();
      setProfesores(data);
    } catch (error) {
      console.error('Error fetching profesores:', error);
      setMessage({ text: 'Error al cargar profesores. Por favor, intente nuevamente.', isError: true });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNuevoProfesor(prev => ({
      ...prev,
      [name]: value
    }));
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
        throw new Error('Error al crear profesor');
      }
      const profesorCreado = await res.json();
      setProfesores(prev => [...prev, profesorCreado]);
      setNuevoProfesor({ nombre: '', apellido: '', dni: '', email: '' });
      setMessage({ text: `Profesor ${profesorCreado.nombre} ${profesorCreado.apellido} creado con éxito.`, isError: false });
    } catch (error) {
      console.error('Error creating profesor:', error);
      setMessage({ text: 'Error al crear profesor. Por favor, intente nuevamente.', isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Title>Profesores</Title>
      <Form onSubmit={handleSubmit}>
        <Input
          type="text"
          name="nombre"
          value={nuevoProfesor.nombre}
          onChange={handleInputChange}
          placeholder="Nombre"
          required
        />
        <Input
          type="text"
          name="apellido"
          value={nuevoProfesor.apellido}
          onChange={handleInputChange}
          placeholder="Apellido"
          required
        />
        <Input
          type="text"
          name="dni"
          value={nuevoProfesor.dni}
          onChange={handleInputChange}
          placeholder="DNI"
          required
        />
        <Input
          type="email"
          name="email"
          value={nuevoProfesor.email}
          onChange={handleInputChange}
          placeholder="Email"
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Agregando...' : 'Agregar Profesor'}
        </Button>
      </Form>
      {message && (
        <Message isError={message.isError}>{message.text}</Message>
      )}
      <Table>
        <thead>
          <Tr>
            <Th>Nombre</Th>
            <Th>Apellido</Th>
            <Th>DNI</Th>
            <Th>Email</Th>
          </Tr>
        </thead>
        <tbody>
          {profesores.map((profesor) => (
            <Tr key={profesor.id}>
              <Td>{profesor.nombre}</Td>
              <Td>{profesor.apellido}</Td>
              <Td>{profesor.dni}</Td>
              <Td>{profesor.email}</Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default Profesores;