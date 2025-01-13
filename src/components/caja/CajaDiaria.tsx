import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useUserRole } from '@/hooks/useUserRole';


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
  gap: 20px;
`;

const FormRow = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
`;

const InputGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Label = styled.label`
  min-width: 100px;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  flex: 1;
`;

const Select = styled.select`
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

const TotalesContainer = styled.div`
  margin-top: 30px;
  background-color: #f0f0f0;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const TotalGeneral = styled.h3`
  font-size: 24px;
  color: #000000;
  margin-bottom: 20px;
  text-align: right;
`;

const TotalesPorTipo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
`;

const TotalTipo = styled.div`
  background-color: #ffffff;
  padding: 15px;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
`;

const TipoLabel = styled.p`
  font-weight: bold;
  margin-bottom: 5px;
`;

const TipoMonto = styled.p`
  font-size: 18px;
  color: #0066cc;
`;

interface Recibo {
  id: number;
  numeroRecibo: number;
  fecha: string;
  alumno?: { id: number; nombre: string; apellido: string };
  alumnoSuelto?: { id: number; nombre: string; apellido: string };
  concepto: { id: number; nombre: string };
  periodoPago: string;
  fueraDeTermino: boolean;
  monto: number;
  tipoPago: string;
}

interface CajaDiariaData {
  recibos: Recibo[];
  totalMonto: number;
  totalPorTipoPago: Record<string, number>;
}

const CajaDiaria = () => {
  const [cajaData, setCajaData] = useState<CajaDiariaData>({ recibos: [], totalMonto: 0, totalPorTipoPago: {} });
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [filtros, setFiltros] = useState({
    numeroRecibo: '',
    alumnoId: '',
    conceptoId: '',
    periodoPago: '',
    fueraDeTermino: '',
    tipoPago: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [alumnos, setAlumnos] = useState<{ id: number; nombre: string; apellido: string }[]>([]);
  const [conceptos, setConceptos] = useState<{ id: number; nombre: string }[]>([]);

  const userRole = useUserRole();

  useEffect(() => {
    if (userRole === 'Dueño' || userRole === 'Secretaria') {
      fetchCajaDiaria();
      fetchAlumnos();
      fetchConceptos();
    }
  }, [userRole]);

  useEffect(() => {
    fetchCajaDiaria()
  }, []) // <-- Agregar fetchCajaDiaria al array de dependencias
  

  const fetchAlumnos = async () => {
    try {
      const res = await fetch('/api/alumnos');
      if (res.ok) {
        const data = await res.json();
        setAlumnos(data);
      }
    } catch (error) {
      console.error('Error fetching alumnos:', error);
    }
  };

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

  const fetchCajaDiaria = async () => {
    if (userRole !== 'Dueño' && userRole !== 'Secretaria') return;
    
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const queryParams = new URLSearchParams({
        ...(userRole === 'Dueño' && fechaInicio && { fechaInicio }),
        ...(userRole === 'Dueño' && fechaFin && { fechaFin }),
        ...(userRole === 'Secretaria' && { fechaInicio: today, fechaFin: today }),
        ...Object.fromEntries(Object.entries(filtros).filter(([_, v]) => v !== ''))
      });
      const res = await fetch(`/api/cajadiaria?${queryParams}`);
      if (!res.ok) throw new Error('Error al obtener recibos');
      const data = await res.json();
      setCajaData(data);
      setMessage({ 
        text: userRole === 'Dueño' && (fechaInicio || fechaFin) ? 
          "Este es el historial de caja en las fechas seleccionadas" : 
          "Esta es la caja del día corriente", 
        isError: false 
      });
    } catch (error) {
      console.error('Error fetching recibos:', error);
      setMessage({ text: 'Error al cargar recibos. Por favor, intente nuevamente.', isError: true });
    } finally {
      setLoading(false);
    }
  };

  const renderAlumnoNombre = (recibo: Recibo) => {
    if (recibo.alumno) {
      return `${recibo.alumno.nombre} ${recibo.alumno.apellido}`;
    } else if (recibo.alumnoSuelto) {
      return `${recibo.alumnoSuelto.nombre} ${recibo.alumnoSuelto.apellido} (Suelto)`;
    }
    return 'Desconocido';
  };

  const handleFiltroChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (userRole === 'Dueño') {
      const { name, value } = e.target;
      setFiltros(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole === 'Dueño' || userRole === 'Secretaria') {
      fetchCajaDiaria();
    }
  };

  if (userRole === 'Profesor') {
    return <Message isError={true}>No tienes acceso a la información de caja diaria.</Message>;
  }

  return (
    <Container>
      <Title>Caja Diaria</Title>
      {userRole === 'Dueño' && (
        <Form onSubmit={handleSubmit}>
          <FormRow>
            <InputGroup>
              <Label>Desde:</Label>
              <Input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </InputGroup>
            <InputGroup>
              <Label>Hasta:</Label>
              <Input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
            </InputGroup>
          </FormRow>
        <FormRow>
          <InputGroup>
            <Label>N° Recibo:</Label>
            <Input
              type="text"
              name="numeroRecibo"
              value={filtros.numeroRecibo}
              onChange={handleFiltroChange}
              placeholder="Número de Recibo"
            />
          </InputGroup>
          <InputGroup>
            <Label>Alumno:</Label>
            <Select
              name="alumnoId"
              value={filtros.alumnoId}
              onChange={handleFiltroChange}
            >
              <option value="">Todos los alumnos</option>
              {alumnos.map(alumno => (
                <option key={alumno.id} value={alumno.id}>
                  {`${alumno.nombre} ${alumno.apellido}`}
                </option>
              ))}
            </Select>
          </InputGroup>
          <InputGroup>
            <Label>Concepto:</Label>
            <Select
              name="conceptoId"
              value={filtros.conceptoId}
              onChange={handleFiltroChange}
            >
              <option value="">Todos los conceptos</option>
              {conceptos.map(concepto => (
                <option key={concepto.id} value={concepto.id}>
                  {concepto.nombre}
                </option>
              ))}
            </Select>
          </InputGroup>
        </FormRow>
        <FormRow>
          <InputGroup>
            <Label>Periodo:</Label>
            <Input
              type="month"
              name="periodoPago"
              value={filtros.periodoPago}
              onChange={handleFiltroChange}
            />
          </InputGroup>
          <InputGroup>
            <Label>Término:</Label>
            <Select
              name="fueraDeTermino"
              value={filtros.fueraDeTermino}
              onChange={handleFiltroChange}
            >
              <option value="">Todos</option>
              <option value="true">Fuera de término</option>
              <option value="false">En término</option>
            </Select>
          </InputGroup>
          <InputGroup>
            <Label>Tipo de Pago:</Label>
            <Select
              name="tipoPago"
              value={filtros.tipoPago}
              onChange={handleFiltroChange}
            >
              <option value="">Todos</option>
              <option value="EFECTIVO">Efectivo</option>
              <option value="MERCADO_PAGO">Mercado Pago</option>
              <option value="TRANSFERENCIA">Transferencia</option>
              <option value="DEBITO_AUTOMATICO">Débito Automático</option>
              <option value="OTRO">Otro</option>
            </Select>
          </InputGroup>
        </FormRow>
        <Button type="submit" disabled={loading}>
            {loading ? 'Cargando...' : 'Buscar'}
          </Button>
        </Form>
      )}

      {message && (
        <Message isError={message.isError}>{message.text}</Message>
      )}

      {cajaData.recibos.length > 0 && (
        <>
         <Table>
  <thead>
    <Tr>
      <Th>N° Recibo</Th>
      <Th>Fecha</Th>
      <Th>Alumno</Th>
      <Th>Concepto</Th>
      <Th>Periodo</Th>
      <Th>Fuera de Término</Th>
      <Th>Importe</Th>
      <Th>Tipo de Pago</Th>
    </Tr>
  </thead>
  <tbody>
    {cajaData.recibos.map((recibo) => (
      <Tr key={recibo.id}>
        <Td>{recibo.numeroRecibo}</Td>
        <Td>{new Date(recibo.fecha).toLocaleDateString()}</Td>
        <Td>{renderAlumnoNombre(recibo)}</Td>
        <Td>{recibo.concepto.nombre}</Td>
        <Td>{recibo.periodoPago}</Td>
        <Td>{recibo.fueraDeTermino ? 'Sí' : 'No'}</Td>
        <Td>${recibo.monto.toFixed(2)}</Td>
        <Td>{recibo.tipoPago}</Td>
      </Tr>
    ))}
  </tbody>
</Table>
          
          <TotalesContainer>
            <TotalGeneral>Total General: ${cajaData.totalMonto.toFixed(2)}</TotalGeneral>
            <TotalesPorTipo>
              {Object.entries(cajaData.totalPorTipoPago).map(([tipo, total]) => (
                <TotalTipo key={tipo}>
                  <TipoLabel>{tipo}</TipoLabel>
                  <TipoMonto>${total.toFixed(2)}</TipoMonto>
                </TotalTipo>
              ))}
            </TotalesPorTipo>
          </TotalesContainer>
        </>
      )}
    </Container>
  );
};

export default CajaDiaria;