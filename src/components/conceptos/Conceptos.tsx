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

const Checkbox = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
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

interface Concepto {
  id: number;
  nombre: string;
  descripcion?: string;
  monto: number;
  fueraDeTermino: boolean;
}

const Conceptos = () => {
  const [conceptos, setConceptos] = useState<Concepto[]>([]);
  const [nuevoConcepto, setNuevoConcepto] = useState({
    nombre: '',
    descripcion: '',
    monto: '',
    fueraDeTermino: false
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  useEffect(() => {
    fetchConceptos();
  }, []);

  const fetchConceptos = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/conceptos');
      if (!res.ok) {
        throw new Error('Error al obtener conceptos');
      }
      const data = await res.json();
      setConceptos(data);
    } catch (error) {
      console.error('Error fetching conceptos:', error);
      setMessage({ text: 'Error al cargar conceptos. Por favor, intente nuevamente.', isError: true });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setNuevoConcepto(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/conceptos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoConcepto),
      });
      if (!res.ok) {
        throw new Error('Error al crear concepto');
      }
      const conceptoCreado = await res.json();
      setConceptos(prev => [...prev, conceptoCreado]);
      setNuevoConcepto({ nombre: '', descripcion: '', monto: '', fueraDeTermino: false });
      setMessage({ text: `Concepto ${conceptoCreado.nombre} creado con éxito.`, isError: false });
    } catch (error) {
      console.error('Error creating concepto:', error);
      setMessage({ text: 'Error al crear concepto. Por favor, intente nuevamente.', isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Title>Conceptos</Title>
      <Form onSubmit={handleSubmit}>
        <Input
          type="text"
          name="nombre"
          value={nuevoConcepto.nombre}
          onChange={handleInputChange}
          placeholder="Nombre"
          required
        />
        <Input
          type="text"
          name="descripcion"
          value={nuevoConcepto.descripcion}
          onChange={handleInputChange}
          placeholder="Descripción"
        />
        <Input
          type="number"
          name="monto"
          value={nuevoConcepto.monto}
          onChange={handleInputChange}
          placeholder="Monto"
          required
          step="0.01"
        />
        <Checkbox>
          <input
            type="checkbox"
            name="fueraDeTermino"
            checked={nuevoConcepto.fueraDeTermino}
            onChange={handleInputChange}
          />
          <label htmlFor="fueraDeTermino">Fuera de término</label>
        </Checkbox>
        <Button type="submit" disabled={loading}>
          {loading ? 'Agregando...' : 'Agregar Concepto'}
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
            <Th>Monto</Th>
            <Th>Fuera de término</Th>
          </Tr>
        </thead>
        <tbody>
          {conceptos.map((concepto) => (
            <Tr key={concepto.id}>
              <Td>{concepto.nombre}</Td>
              <Td>{concepto.descripcion}</Td>
              <Td>${concepto.monto.toFixed(2)}</Td>
              <Td>{concepto.fueraDeTermino ? 'Sí' : 'No'}</Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default Conceptos;