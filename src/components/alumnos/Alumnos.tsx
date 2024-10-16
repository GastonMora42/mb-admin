import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Alumno, Estilo } from '@/types/alumnos-estilos';
import { generarDeudaMensual, darDeBajaAlumno, reactivarAlumno } from '@/utils/alumnoUtils';
import EstilosComponent from './EstilosXAlumnos';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const ScrollableContainer = styled.div`
  max-height: 600px;
  overflow-y: auto;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 20px;
  margin-bottom: 20px;
`;

const HorizontalScrollContainer = styled.div`
  overflow-x: auto;
  white-space: nowrap;
`;

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

const TextArea = styled.textarea`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: vertical;
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

const Message = styled.div<{ isError?: boolean }>`
  margin-top: 20px;
  padding: 10px;
  border-radius: 4px;
  background-color: ${props => props.isError ? '#ffcccc' : '#ccffcc'};
  color: ${props => props.isError ? '#cc0000' : '#006600'};
`;

const Alumnos = () => {
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [estilos, setEstilos] = useState<Estilo[]>([]);
  const [nuevoAlumno, setNuevoAlumno] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    fechaNacimiento: '',
    email: '',
    telefono: '',
    numeroEmergencia: '',
    direccion: '',
    obraSocial: '',
    nombreTutor: '',
    dniTutor: '',
    notas: '',
    estilosIds: [] as string[]
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [mostrarListado, setMostrarListado] = useState(false);

  useEffect(() => {
    fetchAlumnos();
    fetchEstilos();
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

  const fetchEstilos = async () => {
    try {
      const res = await fetch('/api/estilos');
      if (!res.ok) {
        throw new Error('Error al obtener estilos');
      }
      const data = await res.json();
      setEstilos(data);
    } catch (error) {
      console.error('Error fetching estilos:', error);
      setMessage({ text: 'Error al cargar estilos. Por favor, intente nuevamente.', isError: true });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'estilosIds') {
      const selectedOptions = Array.from(
        (e.target as HTMLSelectElement).selectedOptions, 
        option => option.value
      );
      setNuevoAlumno(prev => ({ ...prev, [name]: selectedOptions }));
    } else {
      setNuevoAlumno(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const alumnoData = {
        ...nuevoAlumno,
        fechaNacimiento: new Date(nuevoAlumno.fechaNacimiento).toISOString(),
        activo: true,
        estilosIds: nuevoAlumno.estilosIds.map(id => parseInt(id, 10))
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
      setNuevoAlumno({
        nombre: '', apellido: '', dni: '', fechaNacimiento: '', email: '', telefono: '',
        numeroEmergencia: '', direccion: '', obraSocial: '', nombreTutor: '', dniTutor: '', notas: '',
        estilosIds: []
      });
      setAlumnos(prevAlumnos => [...prevAlumnos, alumnoCreado]);
      await generarDeudaMensual(alumnoCreado.id);
      setMessage({ text: `Alumno ${alumnoCreado.nombre} ${alumnoCreado.apellido} creado con éxito y deuda mensual generada.`, isError: false });
    } catch (error) {
      console.error('Error creating alumno:', error);
      setMessage({ text: 'Error al crear alumno. Por favor, intente nuevamente.', isError: true });
    } finally {
      setLoading(false);
    }
  };

  const handleEstadoAlumno = async (alumnoId: number, nuevoEstado: boolean) => {
    try {
      const res = await fetch('/api/alumnos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: alumnoId, activo: nuevoEstado }),
      });
      if (!res.ok) {
        throw new Error('Error al actualizar estado del alumno');
      }
      await fetchAlumnos();
      setMessage({ text: `Estado del alumno actualizado con éxito.`, isError: false });
    } catch (error) {
      console.error('Error al actualizar estado del alumno:', error);
      setMessage({ text: 'Error al actualizar estado del alumno. Por favor, intente nuevamente.', isError: true });
    }
  };

  const handleEstiloAlumno = async (alumnoId: number, estiloId: number, activo: boolean) => {
    try {
      const res = await fetch('/api/alumnos/estilos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alumnoId, estiloId, activo }),
      });
      if (!res.ok) {
        throw new Error('Error al actualizar estilo del alumno');
      }
      await fetchAlumnos();
      setMessage({ text: `Estilo del alumno actualizado con éxito.`, isError: false });
    } catch (error) {
      console.error('Error al actualizar estilo del alumno:', error);
      setMessage({ text: 'Error al actualizar estilo del alumno. Por favor, intente nuevamente.', isError: true });
    }
  };

  return (
    <PageContainer>
      <Container>
        <Title>Alumnos</Title>
        <ScrollableContainer>
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
        <Input
          type="tel"
          name="numeroEmergencia"
          value={nuevoAlumno.numeroEmergencia}
          onChange={handleInputChange}
          placeholder="Número de Emergencia"
        />
        <Input
          type="text"
          name="direccion"
          value={nuevoAlumno.direccion}
          onChange={handleInputChange}
          placeholder="Dirección"
        />
        <Input
          type="text"
          name="obraSocial"
          value={nuevoAlumno.obraSocial}
          onChange={handleInputChange}
          placeholder="Obra Social"
        />
        <Input
          type="text"
          name="nombreTutor"
          value={nuevoAlumno.nombreTutor}
          onChange={handleInputChange}
          placeholder="Nombre del Tutor (Opcional)"
        />
        <Input
          type="text"
          name="dniTutor"
          value={nuevoAlumno.dniTutor}
          onChange={handleInputChange}
          placeholder="DNI del Tutor (Opcional)"
        />
        <TextArea
          name="notas"
          value={nuevoAlumno.notas}
          onChange={handleInputChange}
          placeholder="Notas (Opcional)"
        />
            <Select
              name="estilosIds"
              multiple
              value={nuevoAlumno.estilosIds}
              onChange={handleInputChange}
            >
              {estilos.map(estilo => (
                <option key={estilo.id} value={estilo.id.toString()}>{estilo.nombre}</option>
              ))}
            </Select>
            <Button type="submit" disabled={loading}>
              {loading ? 'Agregando...' : 'Agregar Alumno'}
            </Button>
          </Form>
        </ScrollableContainer>
        
        <Button onClick={() => setMostrarListado(!mostrarListado)}>
          {mostrarListado ? 'Ocultar Listado' : 'Mostrar Listado'}
        </Button>
        
        {mostrarListado && (
          <ScrollableContainer>
            <HorizontalScrollContainer>
            <Table>
  <thead>
    <Tr>
      <Th>Nombre</Th>
      <Th>Apellido</Th>
      <Th>DNI</Th>
      <Th>Email</Th>
      <Th>Teléfono</Th>
      <Th>Emergencia</Th>
      <Th>Dirección</Th>
      <Th>Obra Social</Th>
      <Th>Tutor</Th>
      <Th>DNI Tutor</Th>
      <Th>Estado</Th>
      <Th>Estilos</Th>
      <Th>Acciones</Th>
    </Tr>
  </thead>
  <tbody>
    {alumnos.map((alumno) => (
      <Tr key={alumno.id}>
        <Td>{alumno.nombre}</Td>
        <Td>{alumno.apellido}</Td>
        <Td>{alumno.dni}</Td>
        <Td>{alumno.email}</Td>
        <Td>{alumno.telefono}</Td>
        <Td>{alumno.numeroEmergencia}</Td>
        <Td>{alumno.direccion}</Td>
        <Td>{alumno.obraSocial}</Td>
        <Td>{alumno.nombreTutor}</Td>
        <Td>{alumno.dniTutor}</Td>
        <Td>{alumno.activo ? 'Activo' : 'Inactivo'}</Td>
        <Td>
          <EstilosComponent 
            alumnoEstilos={alumno.alumnoEstilos} 
            onEstiloToggle={handleEstiloAlumno}
            alumnoId={alumno.id}
          />
        </Td>
        <Td>
          <Button onClick={() => handleEstadoAlumno(alumno.id, !alumno.activo)}>
            {alumno.activo ? 'Dar de Baja' : 'Reactivar'}
          </Button>
        </Td>
      </Tr>
    ))}
  </tbody>
</Table>
            </HorizontalScrollContainer>
          </ScrollableContainer>
        )}
        
        {message && (
          <Message isError={message.isError}>{message.text}</Message>
        )}
      </Container>
    </PageContainer>
  );
};

export default Alumnos;