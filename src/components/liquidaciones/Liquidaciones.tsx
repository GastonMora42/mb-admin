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
  gap: 15px;
  margin-bottom: 20px;
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

const TotalContainer = styled.div`
  margin-top: 20px;
  text-align: right;
  font-size: 18px;
  font-weight: bold;
`;

interface Estilo {
  id: number;
  nombre: string;
}

interface Recibo {
    id: number;
    numeroRecibo: number;
    fecha: string;
    alumno: { nombre: string; apellido: string };
    concepto: { 
      nombre: string; 
      estilo: { nombre: string } 
    };
    monto: number;
  }

const Liquidaciones: React.FC = () => {
  const [estilos, setEstilos] = useState<Estilo[]>([]);
  const [año, setAño] = useState('');
  const [periodo, setPeriodo] = useState('');
  const [estilosSeleccionados, setEstilosSeleccionados] = useState<string[]>([]);
  const [recibos, setRecibos] = useState<Recibo[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchEstilos();
  }, []);

  const fetchEstilos = async () => {
    try {
      const res = await fetch('/api/liquidaciones');
      if (res.ok) {
        const data = await res.json();
        setEstilos(data);
      }
    } catch (error) {
      console.error('Error fetching estilos:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/liquidaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          año, 
          periodo, 
          estilosIds: estilosSeleccionados.map(id => parseInt(id)) 
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setRecibos(data);
        calcularTotal(data);
      }
    } catch (error) {
      console.error('Error fetching recibos:', error);
    }
  };

  const handleMontoChange = (id: number, nuevoMonto: number) => {
    const nuevosRecibos = recibos.map(recibo =>
      recibo.id === id ? { ...recibo, monto: nuevoMonto } : recibo
    );
    setRecibos(nuevosRecibos);
    calcularTotal(nuevosRecibos);
  };

  const calcularTotal = (recibos: Recibo[]) => {
    const nuevoTotal = recibos.reduce((sum, recibo) => sum + recibo.monto, 0);
    setTotal(nuevoTotal);
  };

  return (
    <Container>
      <Title>Liquidaciones</Title>
      <Form onSubmit={handleSubmit}>
        <Select value={año} onChange={(e) => setAño(e.target.value)} required>
          <option value="">Seleccione año</option>
          {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </Select>
        <Select value={periodo} onChange={(e) => setPeriodo(e.target.value)} required>
          <option value="">Seleccione periodo</option>
          {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
            <option key={month} value={month.toString().padStart(2, '0')}>
              {month.toString().padStart(2, '0')}
            </option>
          ))}
        </Select>
        <Select 
  multiple 
  value={estilosSeleccionados}
  onChange={(e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setEstilosSeleccionados(selectedOptions);
  }}
  required
>
  {estilos.map(estilo => (
    <option key={estilo.id} value={estilo.id.toString()}>{estilo.nombre}</option>
  ))}
</Select>
        <Button type="submit">Generar Liquidación</Button>
      </Form>

      {recibos.length > 0 && (
        <>
          <Table>
            <thead>
              <Tr>
                <Th>N° Recibo</Th>
                <Th>Fecha</Th>
                <Th>Alumno</Th>
                <Th>Concepto</Th>
                <Th>Estilo</Th>
                <Th>Importe</Th>
              </Tr>
            </thead>
            <tbody>
              {recibos.map((recibo) => (
                <Tr key={recibo.id}>
                  <Td>{recibo.numeroRecibo}</Td>
                  <Td>{new Date(recibo.fecha).toLocaleDateString()}</Td>
                  <Td>{`${recibo.alumno.nombre} ${recibo.alumno.apellido}`}</Td>
                  <Td>{recibo.concepto.nombre}</Td>
                  <Td>{recibo.concepto.estilo.nombre}</Td>
                  <Td>
                    <input
                      type="number"
                      value={recibo.monto}
                      onChange={(e) => handleMontoChange(recibo.id, Number(e.target.value))}
                      step="0.01"
                    />
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
          <TotalContainer>
            Total: ${total.toFixed(2)}
          </TotalContainer>
        </>
      )}
    </Container>
  );
};

export default Liquidaciones;