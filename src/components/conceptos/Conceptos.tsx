import React, { useState, useEffect, ChangeEvent } from 'react';
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

const FormSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: 500;
  color: #555;
`;

const Message = styled.div<{ isError: boolean }>`
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 4px;
  background-color: ${props => props.isError ? '#ffebee' : '#e8f5e9'};
  color: ${props => props.isError ? '#c62828' : '#2e7d32'};
  border-left: 4px solid ${props => props.isError ? '#c62828' : '#2e7d32'};
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
  profesor?: {
    id: number;
    nombre: string;
    apellido: string;
  };
}

interface Concepto {
  id: number;
  nombre: string;
  descripcion: string | null;
  monto: number;
  estiloId: number | null;
  estilo: Estilo | null;
}

interface NuevoConcepto {
  nombre: string;
  descripcion: string;
  monto: string;
  estiloId: string;
  esClaseSuelta: boolean;
  esInscripcion: false;
}

const Conceptos: React.FC = () => {
  const [conceptos, setConceptos] = useState<Concepto[]>([]);
  const [estilos, setEstilos] = useState<Estilo[]>([]);
  const [nuevoConcepto, setNuevoConcepto] = useState<NuevoConcepto>({
    nombre: '',
    descripcion: '',
    monto: '',
    estiloId: '',
    esClaseSuelta: false,
    esInscripcion: false // Nuevo campo
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  useEffect(() => {
    fetchConceptos();
    fetchEstilos();
  }, []);

  const fetchConceptos = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/conceptos');
      if (!res.ok) throw new Error('Error al obtener conceptos');
      const data = await res.json();
      setConceptos(data);
    } catch (error) {
      console.error('Error:', error);
      setMessage({ text: 'Error al cargar conceptos', isError: true });
    } finally {
      setLoading(false);
    }
  };

  const fetchEstilos = async () => {
    try {
      const res = await fetch('/api/estilos');
      if (!res.ok) throw new Error('Error al obtener estilos');
      const data = await res.json();
      setEstilos(data);
    } catch (error) {
      console.error('Error:', error);
      setMessage({ text: 'Error al cargar estilos', isError: true });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Si es clase suelta, asegurarnos que el nombre sea consistente
      const conceptoData = {
        ...nuevoConcepto,
        nombre: nuevoConcepto.esClaseSuelta ? 'Clase Suelta' : nuevoConcepto.nombre,
        monto: parseFloat(nuevoConcepto.monto),
        estiloId: nuevoConcepto.estiloId ? parseInt(nuevoConcepto.estiloId) : null,
        esClaseSuelta: nuevoConcepto.esClaseSuelta
      };
  

      const res = await fetch('/api/conceptos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(conceptoData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error);
      }

      const conceptoCreado = await res.json();
      setConceptos(prev => [...prev, conceptoCreado]);
      setNuevoConcepto({
        nombre: '',
        descripcion: '',
        monto: '',
        estiloId: '',
        esClaseSuelta: false,
        esInscripcion: false // Nuevo campo
      });
      setMessage({ text: 'Concepto creado exitosamente', isError: false });
    } catch (error) {
      console.error('Error:', error);
      setMessage({ 
        text: error instanceof Error ? error.message : 'Error al crear concepto', 
        isError: true 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Para checkboxes
    if (type === 'checkbox') {
      setNuevoConcepto(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
      return;
    }
  
    // Para todos los demás tipos de inputs
    setNuevoConcepto(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Container>
      <Title>Conceptos</Title>
      
      {message && (
        <Message isError={message.isError}>{message.text}</Message>
      )}

      <Form onSubmit={handleSubmit}>
        <FormSection>
          <FormGroup>
            <Label>Nombre:</Label>
            <Input
              type="text"
              name="nombre"
              value={nuevoConcepto.nombre}
              onChange={handleInputChange}
              placeholder="Nombre del concepto"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Descripción:</Label>
            <Input
              type="text"
              name="descripcion"
              value={nuevoConcepto.descripcion}
              onChange={handleInputChange}
              placeholder="Descripción (opcional)"
            />
          </FormGroup>

          <FormGroup>
            <Label>Monto:</Label>
            <Input
              type="number"
              name="monto"
              value={nuevoConcepto.monto}
              onChange={handleInputChange}
              placeholder="Monto"
              required
              step="0.01"
              min="0"
            />
          </FormGroup>

          <FormGroup>
            <Label>Estilo:</Label>
            <Select
              name="estiloId"
              value={nuevoConcepto.estiloId}
              onChange={handleInputChange}
            >
              <option value="">Seleccione un estilo</option>
              {estilos.map(estilo => (
                <option key={estilo.id} value={estilo.id}>
                  {estilo.nombre} 
                  {estilo.profesor && ` - Prof. ${estilo.profesor.apellido}`}
                </option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup>
            <CheckboxLabel>
              <input
                type="checkbox"
                name="esClaseSuelta"
                checked={nuevoConcepto.esClaseSuelta}
                onChange={handleInputChange}
              />
              Es Clase Suelta
            </CheckboxLabel>
          </FormGroup>
          <FormGroup>
  <CheckboxLabel>
    <input
      type="checkbox"
      name="esInscripcion"
      checked={nuevoConcepto.esInscripcion}
      onChange={handleInputChange}
    />
    Es concepto de inscripción
  </CheckboxLabel>
</FormGroup>
        </FormSection>

        <Button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : 'Crear Concepto'}
        </Button>
      </Form>

      <Table>
        <thead>
          <Tr>
            <Th>Nombre</Th>
            <Th>Descripción</Th>
            <Th>Monto</Th>
            <Th>Estilo</Th>
            <Th>Profesor</Th>
            <Th>Tipo</Th>
          </Tr>
        </thead>
        <tbody>
          {conceptos.map((concepto) => (
            <Tr key={concepto.id}>
              <Td>{concepto.nombre}</Td>
              <Td>{concepto.descripcion}</Td>
              <Td>${concepto.monto.toFixed(2)}</Td>
              <Td>{concepto.estilo?.nombre || '-'}</Td>
              <Td>{concepto.estilo?.profesor ? 
                `${concepto.estilo.profesor.apellido}, ${concepto.estilo.profesor.nombre}` : 
                '-'}
              </Td>
              <Td>{concepto.nombre === 'Clase Suelta' ? 'Clase Suelta' : 'Regular'}</Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default Conceptos;