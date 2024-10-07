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
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 30px;
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

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 5px;
`;

interface Recibo {
  id: number;
  numeroRecibo: number;
  fecha: string;
  monto: number;
  periodoPago: string;
  tipoPago: string;
  fueraDeTermino: boolean;
  alumno: { id: number; nombre: string; apellido: string };
  concepto: { id: number; nombre: string };
}

interface Alumno {
  id: number;
  nombre: string;
  apellido: string;
}

interface Concepto {
  id: number;
  nombre: string;
}

const Recibos = () => {
  const [recibos, setRecibos] = useState<Recibo[]>([]);
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [conceptos, setConceptos] = useState<Concepto[]>([]);
  const [nuevoRecibo, setNuevoRecibo] = useState({
    monto: '',
    periodoPago: '',
    tipoPago: '',
    alumnoId: '',
    conceptoId: '',
    fueraDeTermino: false
  });
  const [filtros, setFiltros] = useState({
    numero: '',
    alumnoId: '',
    conceptoId: '',
    periodo: '',
    fueraDeTermino: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [mostrarRecibos, setMostrarRecibos] = useState(true);

  useEffect(() => {
    fetchRecibos();
    fetchAlumnos();
    fetchConceptos();
  }, []);

  const fetchRecibos = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams(filtros as Record<string, string>);
      const res = await fetch(`/api/recibos?${queryParams}`);
      if (!res.ok) throw new Error('Error al obtener recibos');
      const data = await res.json();
      setRecibos(data);
    } catch (error) {
      console.error('Error fetching recibos:', error);
      setMessage({ text: 'Error al cargar recibos. Por favor, intente nuevamente.', isError: true });
    } finally {
      setLoading(false);
    }
  };

  const fetchAlumnos = async () => {
    try {
      const res = await fetch('/api/alumnos');
      if (!res.ok) throw new Error('Error al obtener alumnos');
      const data = await res.json();
      setAlumnos(data);
    } catch (error) {
      console.error('Error fetching alumnos:', error);
    }
  };

  const fetchConceptos = async () => {
    try {
      const res = await fetch('/api/conceptos');
      if (!res.ok) throw new Error('Error al obtener conceptos');
      const data = await res.json();
      setConceptos(data);
    } catch (error) {
      console.error('Error fetching conceptos:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setNuevoRecibo(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleFiltroChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const reciboData = {
        ...nuevoRecibo,
        fueraDeTermino: nuevoRecibo.fueraDeTermino // Asegúrate de que esto se incluya
      };
      console.log('Enviando recibo:', reciboData); // Para depuración
      const res = await fetch('/api/recibos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reciboData),
      });
      if (!res.ok) throw new Error('Error al crear recibo');
      const reciboCreado = await res.json();
      setRecibos(prev => [reciboCreado, ...prev]);
      setNuevoRecibo({ monto: '', periodoPago: '', tipoPago: '', alumnoId: '', conceptoId: '', fueraDeTermino: false });
      setMessage({ text: `Recibo #${reciboCreado.numeroRecibo} creado con éxito.`, isError: false });
    } catch (error) {
      console.error('Error creating recibo:', error);
      setMessage({ text: 'Error al crear recibo. Por favor, intente nuevamente.', isError: true });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de que desea eliminar este recibo?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/recibos/${id}`, { 
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchRecibos(); // Vuelve a cargar todos los recibos
        setMessage({ text: 'Recibo eliminado con éxito.', isError: false });
      }
      setRecibos(prev => prev.filter(recibo => recibo.id !== id));
      setMessage({ text: 'Recibo eliminado con éxito.', isError: false });
    } catch (error) {
      console.error('Error deleting recibo:', error);
      setMessage({ text: 'Error al eliminar recibo. Por favor, intente nuevamente.', isError: true });
    } finally {
      setLoading(false);
    }
  };
  return (
    <Container>
      <Title>Recibos</Title>
      <Form onSubmit={handleSubmit}>
        <Input
          type="number"
          name="monto"
          value={nuevoRecibo.monto}
          onChange={handleInputChange}
          placeholder="Monto"
          required
          step="0.01"
        />
        <Input
          type="month"
          name="periodoPago"
          value={nuevoRecibo.periodoPago}
          onChange={handleInputChange}
          required
        />
        <Select
          name="tipoPago"
          value={nuevoRecibo.tipoPago}
          onChange={handleInputChange}
          required
        >
          <option value="">Seleccione tipo de pago</option>
          <option value="EFECTIVO">Efectivo</option>
          <option value="MERCADO_PAGO">Mercado Pago</option>
          <option value="TRANSFERENCIA">Transferencia</option>
          <option value="DEBITO_AUTOMATICO">Débito Automático</option>
          <option value="OTRO">Otro</option>
        </Select>
        <Select
          name="alumnoId"
          value={nuevoRecibo.alumnoId}
          onChange={handleInputChange}
          required
        >
          <option value="">Seleccione un alumno</option>
          {alumnos.map((alumno) => (
            <option key={alumno.id} value={alumno.id}>
              {alumno.nombre} {alumno.apellido}
            </option>
          ))}
        </Select>
        <Select
          name="conceptoId"
          value={nuevoRecibo.conceptoId}
          onChange={handleInputChange}
          required
        >
          <option value="">Seleccione un concepto</option>
          {conceptos.map((concepto) => (
            <option key={concepto.id} value={concepto.id}>
              {concepto.nombre}
            </option>
          ))}
        </Select>
        <CheckboxLabel>
          <input
            type="checkbox"
            name="fueraDeTermino"
            checked={nuevoRecibo.fueraDeTermino}
            onChange={handleInputChange}
          />
          Fuera de término
        </CheckboxLabel>
        <Button type="submit" disabled={loading}>
          {loading ? 'Creando...' : 'Crear Recibo'}
        </Button>
      </Form>

      <Title>Filtros</Title>
      <Form onSubmit={(e) => { e.preventDefault(); fetchRecibos(); }}>
        <Input
          type="number"
          name="numero"
          value={filtros.numero}
          onChange={handleFiltroChange}
          placeholder="Número de recibo"
        />
        <Select
          name="alumnoId"
          value={filtros.alumnoId}
          onChange={handleFiltroChange}
        >
          <option value="">Todos los alumnos</option>
          {alumnos.map((alumno) => (
            <option key={alumno.id} value={alumno.id}>
              {alumno.nombre} {alumno.apellido}
            </option>
          ))}
        </Select>
        <Select
          name="conceptoId"
          value={filtros.conceptoId}
          onChange={handleFiltroChange}
        >
          <option value="">Todos los conceptos</option>
          {conceptos.map((concepto) => (
            <option key={concepto.id} value={concepto.id}>
              {concepto.nombre}
            </option>
          ))}
        </Select>
        <Input
          type="month"
          name="periodo"
          value={filtros.periodo}
          onChange={handleFiltroChange}
        />
        <Select
          name="fueraDeTermino"
          value={filtros.fueraDeTermino}
          onChange={handleFiltroChange}
        >
          <option value="">Todos</option>
          <option value="true">Fuera de término</option>
          <option value="false">En término</option>
        </Select>
        <Button type="submit">Aplicar Filtros</Button>
      </Form>

      <Button onClick={() => setMostrarRecibos(!mostrarRecibos)}>
        {mostrarRecibos ? 'Ocultar Recibos' : 'Mostrar Recibos'}
      </Button>

      {message && (
        <Message isError={message.isError}>{message.text}</Message>
      )}

      {mostrarRecibos && (
        <Table>
          <thead>
            <Tr>
              <Th>Número</Th>
              <Th>Fecha</Th>
              <Th>Alumno</Th>
              <Th>Concepto</Th>
              <Th>Monto</Th>
              <Th>Periodo</Th>
              <Th>Tipo de Pago</Th>
              <Th>Fuera de Término</Th>
              <Th>Acciones</Th>
            </Tr>
          </thead>
          <tbody>
            {recibos.map((recibo) => (
              <Tr key={recibo.id}>
                <Td>{recibo.numeroRecibo}</Td>
                <Td>{new Date(recibo.fecha).toLocaleDateString()}</Td>
                <Td>{`${recibo.alumno.nombre} ${recibo.alumno.apellido}`}</Td>
                <Td>{recibo.concepto.nombre}</Td>
                <Td>${recibo.monto.toFixed(2)}</Td>
                <Td>{recibo.periodoPago}</Td>
                <Td>{recibo.tipoPago}</Td>
                <Td>{recibo.fueraDeTermino ? 'Sí' : 'No'}</Td>
                <Td>
                <Button 
  onClick={() => handleDelete(recibo.id)} 
  disabled={loading}
>
  {loading ? 'Eliminando...' : 'Eliminar'}
</Button>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default Recibos;