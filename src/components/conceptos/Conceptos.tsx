import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';

// Styled Components
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
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #FFC001;
    box-shadow: 0 0 0 2px rgba(255, 192, 1, 0.2);
  }
`;

const SearchInput = styled(Input)`
  max-width: 300px;
  margin-bottom: 20px;
`;

const Select = styled.select`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #FFC001;
    box-shadow: 0 0 0 2px rgba(255, 192, 1, 0.2);
  }
`;

const Button = styled.button`
  background-color: #FFC001;
  color: #000000;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  
  &:hover {
    background-color: #e6ac00;
    transform: translateY(-1px);
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
    transform: none;
  }
`;

const ActionButton = styled(Button)`
  padding: 8px 16px;
  font-size: 0.9em;
  
  &.edit {
    background-color: #4CAF50;
    color: white;
    
    &:hover {
      background-color: #45a049;
    }
  }
  
  &.delete {
    background-color: #f44336;
    color: white;
    
    &:hover {
      background-color: #da190b;
    }
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
  font-weight: 500;
`;

const Td = styled.td`
  border-bottom: 1px solid #F9F8F8;
  padding: 12px;
`;

const Tr = styled.tr`
  &:nth-child(even) {
    background-color: #F9F8F8;
  }
  &:hover {
    background-color: #f5f5f5;
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
`;

const ModalTitle = styled.h3`
  margin-bottom: 20px;
  color: #000000;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
`;

// Interfaces actualizadas
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
  montoRegular: number; // Reemplaza monto
  montoSuelto: number;  // Nuevo campo
  estiloId: number | null;
  estilo: Estilo | null;
  esClaseSuelta?: boolean;
  esInscripcion: boolean;
}

interface ConceptoEdicion {
  id: number;
  nombre: string;
  descripcion: string;
  montoRegular: number; // Reemplaza monto
  montoSuelto: number;  // Nuevo campo
  estiloId: number | null;
  esClaseSuelta: boolean;
  esInscripcion: boolean;
}

interface NuevoConcepto {
  nombre: string;
  descripcion: string;
  montoRegular: string; // Reemplaza monto
  montoSuelto: string;  // Nuevo campo
  estiloId: string;
  esClaseSuelta: boolean;
  esInscripcion: boolean;
}

const Conceptos: React.FC = () => {
  const [conceptos, setConceptos] = useState<Concepto[]>([]);
  const [estilos, setEstilos] = useState<Estilo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [conceptoEnEdicion, setConceptoEnEdicion] = useState<ConceptoEdicion | null>(null);
  const [nuevoConcepto, setNuevoConcepto] = useState<NuevoConcepto>({
    nombre: '',
    descripcion: '',
    montoRegular: '',
    montoSuelto: '',
    estiloId: '',
    esClaseSuelta: false,
    esInscripcion: false
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
      const conceptoData = {
        ...nuevoConcepto,
        nombre: nuevoConcepto.esClaseSuelta ? 'Clase Suelta' : nuevoConcepto.nombre,
        montoRegular: parseFloat(nuevoConcepto.montoRegular),
        montoSuelto: parseFloat(nuevoConcepto.montoSuelto || nuevoConcepto.montoRegular),
        estiloId: nuevoConcepto.estiloId ? parseInt(nuevoConcepto.estiloId) : null
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

      await fetchConceptos();
      setNuevoConcepto({
        nombre: '',
        descripcion: '',
        montoRegular: '',
        montoSuelto: '',
        estiloId: '',
        esClaseSuelta: false,
        esInscripcion: false
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

  const handleEditar = (concepto: Concepto) => {
    setConceptoEnEdicion({
      id: concepto.id,
      nombre: concepto.nombre,
      descripcion: concepto.descripcion || '',
      montoRegular: concepto.montoRegular,
      montoSuelto: concepto.montoSuelto,
      estiloId: concepto.estiloId,
      esClaseSuelta: concepto.esClaseSuelta || false,
      esInscripcion: concepto.esInscripcion
    });
  };

  const handleGuardarEdicion = async () => {
    if (!conceptoEnEdicion) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/conceptos/${conceptoEnEdicion.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(conceptoEnEdicion),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error);
      }

      await fetchConceptos();
      setConceptoEnEdicion(null);
      setMessage({ text: 'Concepto actualizado exitosamente', isError: false });
    } catch (error) {
      console.error('Error:', error);
      setMessage({ 
        text: error instanceof Error ? error.message : 'Error al actualizar concepto', 
        isError: true 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id: number) => {
    if (!confirm('¿Está seguro que desea eliminar este concepto?')) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/conceptos/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error);
      }

      await fetchConceptos();
      setMessage({ text: 'Concepto eliminado exitosamente', isError: false });
    } catch (error) {
      console.error('Error:', error);
      setMessage({ 
        text: error instanceof Error ? error.message : 'Error al eliminar concepto', 
        isError: true 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setNuevoConcepto(prev => ({
        ...prev,
        [name]: checked
      }));
      return;
    }
  
    setNuevoConcepto(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEdicionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!conceptoEnEdicion) return;
    
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setConceptoEnEdicion(prev => ({
        ...prev!,
        [name]: checked
      }));
      return;
    }
    
    setConceptoEnEdicion(prev => ({
      ...prev!,
      [name]: name === 'montoRegular' || name === 'montoSuelto' 
        ? parseFloat(value) || 0
        : value
    }));
  };

  const filteredConceptos = useMemo(() => {
    if (!searchTerm) return conceptos;
    const searchLower = searchTerm.toLowerCase();
    return conceptos.filter(concepto => 
      concepto.nombre.toLowerCase().includes(searchLower) ||
      concepto.estilo?.nombre.toLowerCase().includes(searchLower)
    );
  }, [conceptos, searchTerm]);

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
              disabled={nuevoConcepto.esClaseSuelta}
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
            <Label>Monto Regular:</Label>
            <Input
              type="number"
              name="montoRegular"
              value={nuevoConcepto.montoRegular}
              onChange={handleInputChange}
              placeholder="Monto para clases regulares"
              required
              min="0"
            />
          </FormGroup>

          <FormGroup>
            <Label>Monto Clases Sueltas:</Label>
            <Input
              type="number"
              name="montoSuelto"
              value={nuevoConcepto.montoSuelto}
              onChange={handleInputChange}
              placeholder="Monto para clases sueltas"
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
      
      <h2>Buscar Conceptos</h2>
      <SearchInput
        type="text"
        placeholder="Buscar por nombre de concepto o estilo..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <Table>
        <thead>
          <Tr>
            <Th>Nombre</Th>
            <Th>Descripción</Th>
            <Th>Montos</Th>
            <Th>Estilo</Th>
            <Th>Profesor</Th>
            <Th>Tipo</Th>
            <Th>Acciones</Th>
          </Tr>
        </thead>
        <tbody>
          {filteredConceptos.map((concepto) => (
            <Tr key={concepto.id}>
              <Td>{concepto.nombre}</Td>
              <Td>{concepto.descripcion}</Td>
              <Td>
                <div>Regular: ${concepto.montoRegular?.toFixed(0) || "0"}</div>
                <div>Suelto: ${concepto.montoSuelto?.toFixed(0) || "0"}</div>
              </Td>
              <Td>{concepto.estilo?.nombre || '-'}</Td>
              <Td>
                {concepto.estilo?.profesor 
                  ? `${concepto.estilo.profesor.apellido}, ${concepto.estilo.profesor.nombre}`
                  : '-'}
              </Td>
              <Td>
                {concepto.esClaseSuelta 
                  ? 'Clase Suelta' 
                  : concepto.esInscripcion 
                    ? 'Inscripción'
                    : 'Regular'}
              </Td>
              <Td>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <ActionButton
                    type="button"
                    className="edit"
                    onClick={() => handleEditar(concepto)}
                  >
                    Editar
                  </ActionButton>
                  <ActionButton
                    type="button"
                    className="delete"
                    onClick={() => handleEliminar(concepto.id)}
                  >
                    Eliminar
                  </ActionButton>
                </div>
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>

      {conceptoEnEdicion && (
        <Modal>
          <ModalContent>
            <ModalTitle>Editar Concepto</ModalTitle>
            <Form onSubmit={(e) => {
              e.preventDefault();
              handleGuardarEdicion();
            }}>
              <Input
                type="text"
                name="nombre"
                value={conceptoEnEdicion.nombre}
                onChange={handleEdicionChange}
                placeholder="Nombre"
                required
                disabled={conceptoEnEdicion.esClaseSuelta}
              />
              <Input
                type="text"
                name="descripcion"
                value={conceptoEnEdicion.descripcion}
                onChange={handleEdicionChange}
                placeholder="Descripción"
              />
              <FormGroup>
                <Label>Monto Regular:</Label>
                <Input
                  type="number"
                  name="montoRegular"
                  value={conceptoEnEdicion.montoRegular}
                  onChange={handleEdicionChange}
                  placeholder="Monto para clases regulares"
                  required
                  min="0"
                />
              </FormGroup>
              <FormGroup>
                <Label>Monto Clases Sueltas:</Label>
                <Input
                  type="number"
                  name="montoSuelto"
                  value={conceptoEnEdicion.montoSuelto}
                  onChange={handleEdicionChange}
                  placeholder="Monto para clases sueltas"
                  required
                  min="0"
                />
              </FormGroup>
              <Select
                name="estiloId"
                value={conceptoEnEdicion.estiloId || ''}
                onChange={handleEdicionChange}
              >
                <option value="">Seleccione un estilo</option>
                {estilos.map(estilo => (
                  <option key={estilo.id} value={estilo.id}>
                    {estilo.nombre}
                    {estilo.profesor && ` - Prof. ${estilo.profesor.apellido}`}
                  </option>
                ))}
              </Select>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  name="esClaseSuelta"
                  checked={conceptoEnEdicion.esClaseSuelta}
                  onChange={handleEdicionChange}
                />
                Es Clase Suelta
              </CheckboxLabel>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  name="esInscripcion"
                  checked={conceptoEnEdicion.esInscripcion}
                  onChange={handleEdicionChange}
                />
                Es concepto de inscripción
              </CheckboxLabel>
              <ButtonGroup>
                <Button
                  type="button"
                  onClick={() => setConceptoEnEdicion(null)}
                  style={{ backgroundColor: '#cccccc' }}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </ButtonGroup>
            </Form>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default Conceptos;