import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Alumno } from '@/types';

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
  gap: 15px;
  margin-bottom: 30px;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  flex: 1;
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

const Alumnos = () => {
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [nuevoAlumno, setNuevoAlumno] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    fechaNacimiento: '',
    email: '',
    telefono: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  useEffect(() => {
    fetchAlumnos();
  }, []);

  const fetchAlumnos = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/alumnos');
      if (!res.ok) {
        throw new Error('Error al obtener alumnos');
      }
      const data = await res.json();
      setAlumnos(data);
      setMessage({ text: `Se cargaron ${data.length} alumnos correctamente.`, isError: false });
    } catch (error) {
      console.error('Error fetching alumnos:', error);
      setMessage({ text: 'Error al cargar alumnos. Por favor, intente nuevamente.', isError: true });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNuevoAlumno({ ...nuevoAlumno, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const alumnoData = {
        ...nuevoAlumno,
        fechaNacimiento: new Date(nuevoAlumno.fechaNacimiento).toISOString(),
        activo: true
      };
      const res = await fetch('/api/alumnos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alumnoData),
      });
      if (!res.ok) {
        throw new Error('Error al crear alumno');
      }
      const alumnoCreado = await res.json();
      setNuevoAlumno({ nombre: '', apellido: '', dni: '', fechaNacimiento: '', email: '', telefono: '' });
      setAlumnos(prevAlumnos => [...prevAlumnos, alumnoCreado]);
      setMessage({ text: `Alumno ${alumnoCreado.nombre} ${alumnoCreado.apellido} creado con éxito.`, isError: false });
    } catch (error) {
      console.error('Error creating alumno:', error);
      setMessage({ text: 'Error al crear alumno. Por favor, intente nuevamente.', isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Title>Alumnos</Title>
      <Form onSubmit={handleSubmit}>
  <Input
    type="text"
    name="nombre"
    value={nuevoAlumno.nombre}
    onChange={handleInputChange}
    placeholder="Nombre"
    required
  />
  <Input
    type="text"
    name="apellido"
    value={nuevoAlumno.apellido}
    onChange={handleInputChange}
    placeholder="Apellido"
    required
  />
  <Input
    type="text"
    name="dni"
    value={nuevoAlumno.dni}
    onChange={handleInputChange}
    placeholder="DNI"
    required
  />
  <Input
    type="date"
    name="fechaNacimiento"
    value={nuevoAlumno.fechaNacimiento}
    onChange={handleInputChange}
    required
  />
  <Input
    type="email"
    name="email"
    value={nuevoAlumno.email}
    onChange={handleInputChange}
    placeholder="Email"
  />
  <Input
    type="tel"
    name="telefono"
    value={nuevoAlumno.telefono}
    onChange={handleInputChange}
    placeholder="Teléfono"
  />
  <Button type="submit" disabled={loading}>
    {loading ? 'Agregando...' : 'Agregar Alumno'}
  </Button>
</Form>
      <Button onClick={fetchAlumnos} disabled={loading}>
        {loading ? 'Cargando...' : 'Actualizar Lista de Alumnos'}
      </Button>
      {message && (
        <Message isError={message.isError}>{message.text}</Message>
      )}
      {alumnos.length > 0 ? (
        <Table>
          <thead>
            <Tr>
              <Th>Nombre</Th>
              <Th>Apellido</Th>
              <Th>DNI</Th>
            </Tr>
          </thead>
          <tbody>
            {alumnos.map((alumno) => (
              <Tr key={alumno.id}>
                <Td>{alumno.nombre}</Td>
                <Td>{alumno.apellido}</Td>
                <Td>{alumno.dni}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p>No hay alumnos para mostrar.</p>
      )}
    </Container>
  );
};

export default Alumnos;