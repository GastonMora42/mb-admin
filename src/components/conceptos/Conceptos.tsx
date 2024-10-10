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

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
`;

interface Estilo {
  id: number;
  nombre: string;
}

interface Concepto {
  id: number;
  nombre: string;
  descripcion: string | null;
  monto: number;
  estiloId: number;
  estilo: Estilo;
  fueraDeTermino: boolean;
}

const Conceptos: React.FC = () => {
  const [conceptos, setConceptos] = useState<Concepto[]>([]);
  const [estilos, setEstilos] = useState<Estilo[]>([]);
  const [nuevoConcepto, setNuevoConcepto] = useState({
    nombre: '',
    descripcion: '',
    monto: '',
    estiloId: '',
    fueraDeTermino: false
  });
  
  useEffect(() => {
    fetchConceptos();
    fetchEstilos();
  }, []);

  const fetchConceptos = async () => {
    try {
      const res = await fetch('/api/conceptos');
      if (res.ok) {
        const data = await res.json();
        setConceptos(data);
      }
    } catch (error) {
      console.error('Error fetching conceptos:', error);
    }
  };

  const fetchEstilos = async () => {
    try {
      const res = await fetch('/api/estilos');
      if (res.ok) {
        const data = await res.json();
        setEstilos(data);
      }
    } catch (error) {
      console.error('Error fetching estilos:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setNuevoConcepto(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/conceptos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoConcepto),
      });
      if (res.ok) {
        const conceptoCreado = await res.json();
        setConceptos(prev => [...prev, conceptoCreado]);
        setNuevoConcepto({ nombre: '', descripcion: '', monto: '', estiloId: '', fueraDeTermino: false });
      }
    } catch (error) {
      console.error('Error creating concepto:', error);
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
        <Button type="submit">Agregar Concepto</Button>
      </Form>

      <Table>
        <thead>
          <Tr>
            <Th>Titulo</Th>
            <Th>Descripción</Th>
            <Th>Monto</Th>
          </Tr>
        </thead>
        <tbody>
          {conceptos.map((concepto) => (
            <Tr key={concepto.id}>
              <Td>{concepto.nombre}</Td>
              <Td>{concepto.descripcion}</Td>
              <Td>${concepto.monto.toFixed(2)}</Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default Conceptos;