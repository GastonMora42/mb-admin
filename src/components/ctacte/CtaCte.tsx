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

const SearchInput = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const AlumnoList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const AlumnoItem = styled.li`
  padding: 10px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  &:hover {
    background-color: #f0f0f0;
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

interface Alumno {
  id: number;
  nombre: string;
  apellido: string;
}

interface Recibo {
  id: number;
  numeroRecibo: number;
  fecha: string;
  periodoPago: string;
  alumno: Alumno;
  concepto: { nombre: string };
  monto: number;
  tipoPago: string;
}

const CtaCte: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [selectedAlumno, setSelectedAlumno] = useState<Alumno | null>(null);
  const [recibos, setRecibos] = useState<Recibo[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (searchTerm.length > 2) {
      fetchAlumnos();
    } else {
      setAlumnos([]);
    }
  }, [searchTerm]);

  const fetchAlumnos = async () => {
    try {
      const res = await fetch(`/api/ctacte?query=${searchTerm}`);
      if (res.ok) {
        const data = await res.json();
        setAlumnos(data);
      }
    } catch (error) {
      console.error('Error fetching alumnos:', error);
    }
  };

  const fetchRecibos = async (alumnoId: number) => {
    try {
      const res = await fetch(`/api/ctacte?alumnoId=${alumnoId}`);
      if (res.ok) {
        const data = await res.json();
        setRecibos(data.recibos);
        setTotal(data.total);
      }
    } catch (error) {
      console.error('Error fetching recibos:', error);
    }
  };

  const handleAlumnoSelect = (alumno: Alumno) => {
    setSelectedAlumno(alumno);
    fetchRecibos(alumno.id);
    setSearchTerm('');
    setAlumnos([]);
  };

  return (
    <Container>
      <Title>Cuenta Corriente</Title>
      <SearchInput
        type="text"
        placeholder="Buscar alumno..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {alumnos.length > 0 && (
        <AlumnoList>
          {alumnos.map((alumno) => (
            <AlumnoItem key={alumno.id} onClick={() => handleAlumnoSelect(alumno)}>
              {alumno.nombre} {alumno.apellido}
            </AlumnoItem>
          ))}
        </AlumnoList>
      )}
      {selectedAlumno && (
        <>
          <h3>Recibos de {selectedAlumno.nombre} {selectedAlumno.apellido}</h3>
          <Table>
            <thead>
              <Tr>
                <Th>N° Recibo</Th>
                <Th>Fecha</Th>
                <Th>Periodo</Th>
                <Th>Concepto</Th>
                <Th>Importe</Th>
                <Th>Forma de Pago</Th>
              </Tr>
            </thead>
            <tbody>
              {recibos.map((recibo) => (
                <Tr key={recibo.id}>
                  <Td>{recibo.numeroRecibo}</Td>
                  <Td>{new Date(recibo.fecha).toLocaleDateString()}</Td>
                  <Td>{recibo.periodoPago}</Td>
                  <Td>{recibo.concepto.nombre}</Td>
                  <Td>${recibo.monto.toFixed(2)}</Td>
                  <Td>{recibo.tipoPago}</Td>
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

export default CtaCte;