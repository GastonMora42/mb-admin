import React, { useState, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { Alumno, Estilo } from '@/types/alumnos-estilos';
import EstilosComponent from './EstilosXAlumnos';
import EditAlumnoModal from '@/pages/api/alumnos/EditAlumnoModal';

const GlobalStyle = createGlobalStyle`
  * {
    color: #000000;
  }

  [style*="background-color: #000000"],
  [style*="background-color:#000000"],
  .bg-black,
  th {
    color: #FFFFFF !important;
  }

  input,
  textarea,
  select {
    color: #000000 !important;
    -webkit-text-fill-color: #000000 !important;
  }

  ::placeholder {
    color: #666666 !important;
    -webkit-text-fill-color: #666666 !important;
  }
`;

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
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

const Th = styled.th`
  background-color: #000000;
  color: #FFFFFF !important;
  text-align: left;
  padding: 12px;
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

const ScrollableContainer = styled.div`
  max-height: 600px;
  overflow-y: auto;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 20px;
  margin-bottom: 20px;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  color: #333333; // Color gris oscuro para el texto
  background-color: #ffffff; // Fondo blanco explícito
  
  &::placeholder {
    color: #666666; // Color más claro para el placeholder
  }

  &:focus {
    color: #000000; // Negro cuando está en foco
    outline-color: #FFC001; // Mantiene el color de tu tema
  }
`;

const TextArea = styled.textarea`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: vertical;
  min-height: 100px;
  color: #333333; // Color gris oscuro para el texto
  background-color: #ffffff; // Fondo blanco explícito
  
  &::placeholder {
    color: #666666; // Color más claro para el placeholder
  }

  &:focus {
    color: #000000; // Negro cuando está en foco
    outline-color: #FFC001; // Mantiene el color de tu tema
  }
`;

const Select = styled.select`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  color: #333333; // Color gris oscuro para el texto
  background-color: #ffffff; // Fondo blanco explícito
  
  option {
    color: #333333; // Color gris oscuro para las opciones
    background-color: #ffffff; // Fondo blanco para las opciones
  }

  &:focus {
    color: #000000;
    outline-color: #FFC001;
  }
`;

const HorizontalScrollContainer = styled.div`
  overflow-x: auto;
  white-space: nowrap;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const FilterContainer = styled.div`
  margin-bottom: 20px;
  display: flex;
  gap: 20px;
  align-items: center;
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
`;

const SearchInput = styled(Input)`
  min-width: 300px;
`;

function Alumnos() {
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [estilos, setEstilos] = useState<Estilo[]>([]);
  const [editandoAlumno, setEditandoAlumno] = useState<Alumno | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [mostrarListado, setMostrarListado] = useState(false);
  const [filtro, setFiltro] = useState('');
  const [alumnosFiltrados, setAlumnosFiltrados] = useState<Alumno[]>([]);
  const [tipoAlumno, setTipoAlumno] = useState<'regular' | 'suelto'>('regular');
  const [descuentoAutomatico, setDescuentoAutomatico] = useState<number | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
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
    estilosIds: [] as string[],
    descuentoManual: ''
  });
  // Effects
useEffect(() => {
  fetchAlumnos();
  fetchEstilos();
}, []);

useEffect(() => {
  const filtered = alumnos.filter(alumno => 
    alumno.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    alumno.apellido.toLowerCase().includes(filtro.toLowerCase()) ||
    alumno.dni.includes(filtro)
  );
  setAlumnosFiltrados(filtered);
}, [filtro, alumnos]);

// Functions
const fetchAlumnos = async () => {
  setLoading(true);
  try {
    const res = await fetch('/api/alumnos');
    if (!res.ok) throw new Error('Error al obtener alumnos');
    const data = await res.json();
    setAlumnos(data);
    setMessage({ text: 'Alumnos cargados correctamente', isError: false });
  } catch (error) {
    console.error('Error fetching alumnos:', error);
    setMessage({ text: 'Error al cargar alumnos', isError: true });
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
    console.error('Error fetching estilos:', error);
    setMessage({ text: 'Error al cargar estilos', isError: true });
  }
};

const calcularDescuentoAutomatico = (estilosSeleccionados: string[]) => {
  if (estilosSeleccionados.length >= 2) {
    const porcentaje = estilosSeleccionados.length >= 3 ? 15 : 10;
    setDescuentoAutomatico(porcentaje);
  } else {
    setDescuentoAutomatico(null);
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
    calcularDescuentoAutomatico(selectedOptions);
  } else {
    setNuevoAlumno(prev => ({ ...prev, [name]: value }));
  }
};

// En la función handleSubmit de la página Alumnos
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  try {
    // Obtener el concepto de inscripción
    const conceptoInscripcion = await fetch('/api/conceptos?esInscripcion=true')
      .then(res => res.json())
      .then(data => data[0]); // Asumimos que solo hay un concepto de inscripción

    const alumnoData = {
      ...nuevoAlumno,
      fechaNacimiento: tipoAlumno === 'regular' ? new Date(nuevoAlumno.fechaNacimiento).toISOString() : undefined,
      activo: true,
      estilosIds: nuevoAlumno.estilosIds.map(id => parseInt(id, 10)),
      descuentoManual: nuevoAlumno.descuentoManual ? parseFloat(nuevoAlumno.descuentoManual) : undefined,
      tipoAlumno,
      // Agregar la deuda de inscripción si existe el concepto
      deudaInscripcion: conceptoInscripcion ? {
        monto: conceptoInscripcion.monto,
        montoOriginal: conceptoInscripcion.monto,
        conceptoId: conceptoInscripcion.id,
        fechaVencimiento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días desde hoy
        pagada: false
      } : undefined
    };

    const res = await fetch('/api/alumnos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alumnoData),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Error al crear alumno');
    }

    const alumnoCreado = await res.json();
    setNuevoAlumno({
      nombre: '', apellido: '', dni: '', fechaNacimiento: '', 
      email: '', telefono: '', numeroEmergencia: '', direccion: '', 
      obraSocial: '', nombreTutor: '', dniTutor: '', notas: '',
      estilosIds: [], descuentoManual: ''
    });
    setDescuentoAutomatico(null);
    setMostrarFormulario(false);
    await fetchAlumnos();
    setMessage({ 
      text: `${tipoAlumno === 'regular' ? 'Alumno' : 'Alumno suelto'} creado con éxito`, 
      isError: false 
    });
  } catch (error) {
    console.error('Error creating alumno:', error);
    setMessage({ 
      text: error instanceof Error ? error.message : 'Error al crear alumno', 
      isError: true 
    });
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
    if (!res.ok) throw new Error('Error al actualizar estado');
    await fetchAlumnos();
    setMessage({ 
      text: `Estado del alumno actualizado correctamente`, 
      isError: false 
    });
  } catch (error) {
    console.error('Error:', error);
    setMessage({ 
      text: 'Error al actualizar estado', 
      isError: true 
    });
  }
};

const handleEstiloAlumno = async (alumnoId: number, estiloId: number) => {
  try {
    // Obtener el estado actual del estilo para este alumno
    const alumno = alumnos.find(a => a.id === alumnoId);
    const estiloActual = alumno?.alumnoEstilos.find(ae => ae.estilo.id === estiloId);
    const nuevoEstado = !estiloActual?.activo; // Si estaba activo, lo desactivamos y viceversa

    const res = await fetch('/api/alumnos/estilos', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        alumnoId,
        estiloId,
        activo: nuevoEstado
      }),
    });

    if (!res.ok) {
      throw new Error('Error al actualizar estilo del alumno');
    }

    await fetchAlumnos(); // Recargar los datos
    setMessage({ 
      text: `Estilo ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`, 
      isError: false 
    });
  } catch (error) {
    console.error('Error al actualizar estilo:', error);
    setMessage({ 
      text: 'Error al actualizar estilo del alumno', 
      isError: true 
    });
  }
};

const handleGuardarEdicion = async (alumnoData: any) => {
  try {
    setLoading(true);
    const res = await fetch('/api/alumnos', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alumnoData),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Error al actualizar alumno');
    }

    const alumnoActualizado = await res.json();
    await fetchAlumnos();
    setEditandoAlumno(null);
    setMessage({ 
      text: 'Alumno actualizado correctamente', 
      isError: false 
    });
  } catch (error) {
    console.error('Error:', error);
    setMessage({ 
      text: error instanceof Error ? error.message : 'Error al actualizar alumno', 
      isError: true 
    });
  } finally {
    setLoading(false);
  }
};
return (
  <PageContainer>
    <GlobalStyle />
    <Container>
      <Title>Gestión de Alumnos</Title>

      <FilterContainer>
        {/* Selector de tipo de alumno */}
        <RadioGroup>
          <label>
            <input
              type="radio"
              name="tipoAlumno"
              value="regular"
              checked={tipoAlumno === 'regular'}
              onChange={(e) => setTipoAlumno(e.target.value as 'regular' | 'suelto')}
            /> Alumno Regular
          </label>
          <label>
            <input
              type="radio"
              name="tipoAlumno"
              value="suelto"
              checked={tipoAlumno === 'suelto'}
              onChange={(e) => setTipoAlumno(e.target.value as 'regular' | 'suelto')}
            /> Alumno Suelto
          </label>
        </RadioGroup>

        {/* Botón para mostrar/ocultar formulario */}
        <Button onClick={() => setMostrarFormulario(!mostrarFormulario)}>
          {mostrarFormulario ? 'Cancelar Registro' : 'Nuevo Alumno'}
        </Button>
      </FilterContainer>

      {/* Formulario de registro */}
      {mostrarFormulario && (
        <ScrollableContainer>
          <Form onSubmit={handleSubmit}>
            {/* Campos comunes para ambos tipos de alumno */}
        {/* Campos básicos */}
<div style={{ marginBottom: '30px' }}>
  <Title style={{ fontSize: '1.3em', marginBottom: '20px' }}>
    {tipoAlumno === 'regular' ? 'Nuevo Alumno Regular' : 'Nuevo Alumno Suelto'}
  </Title>
  
  {/* Contenedor de datos básicos */}
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
    <div>
      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
        Nombre *
      </label>
      <Input
        type="text"
        name="nombre"
        value={nuevoAlumno.nombre}
        onChange={handleInputChange}
        required
      />
    </div>

    <div>
      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
        Apellido *
      </label>
      <Input
        type="text"
        name="apellido"
        value={nuevoAlumno.apellido}
        onChange={handleInputChange}
        required
      />
    </div>

    <div>
      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
        DNI *
      </label>
      <Input
        type="text"
        name="dni"
        value={nuevoAlumno.dni}
        onChange={handleInputChange}
        required
      />
    </div>

    <div>
      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
        Email
      </label>
      <Input
        type="email"
        name="email"
        value={nuevoAlumno.email}
        onChange={handleInputChange}
        placeholder="ejemplo@email.com"
      />
    </div>

    <div style={{ gridColumn: tipoAlumno === 'suelto' ? 'span 2' : 'auto' }}>
      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
        Teléfono
      </label>
      <Input
        type="tel"
        name="telefono"
        value={nuevoAlumno.telefono}
        onChange={handleInputChange}
        placeholder="+54 "
      />
    </div>

    {tipoAlumno === 'regular' && (
      <div>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Fecha de Nacimiento *
        </label>
        <Input
          type="date"
          name="fechaNacimiento"
          value={nuevoAlumno.fechaNacimiento}
          onChange={handleInputChange}
          required
        />
      </div>
    )}
  </div>

  <div style={{ 
    borderTop: '1px solid #eee', 
    paddingTop: '15px', 
    marginTop: '15px', 
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px'
  }}>
    <Button 
      type="button" 
      onClick={() => setMostrarFormulario(false)}
      style={{ backgroundColor: '#f0f0f0', color: '#333' }}
    >
      Cancelar
    </Button>
    {tipoAlumno === 'suelto' ? (
      <Button type="submit" disabled={loading}>
        {loading ? 'Guardando...' : 'Registrar Alumno Suelto'}
      </Button>
    ) : (
      <Button type="submit" disabled={loading}>
        {loading ? 'Guardando...' : 'Continuar con Registro'}
      </Button>
    )}
  </div>
</div>

{/* Campos adicionales para alumno regular */}
{tipoAlumno === 'regular' && (
  <>
    {/* Información de Contacto y Emergencia */}
    <div style={{ marginTop: '30px', marginBottom: '30px' }}>
      <Title style={{ fontSize: '1.2em', marginBottom: '20px' }}>
        Información de Contacto y Emergencia
      </Title>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Número de Emergencia
          </label>
          <Input
            type="tel"
            name="numeroEmergencia"
            value={nuevoAlumno.numeroEmergencia}
            onChange={handleInputChange}
            placeholder="+54 "
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Obra Social
          </label>
          <Input
            type="text"
            name="obraSocial"
            value={nuevoAlumno.obraSocial}
            onChange={handleInputChange}
          />
        </div>

        <div style={{ gridColumn: 'span 2' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Dirección
          </label>
          <Input
            type="text"
            name="direccion"
            value={nuevoAlumno.direccion}
            onChange={handleInputChange}
            placeholder="Calle, Número, Ciudad"
          />
        </div>
      </div>
    </div>

    {/* Información del Tutor */}
    <div style={{ marginBottom: '30px' }}>
      <Title style={{ fontSize: '1.2em', marginBottom: '20px' }}>
        Información del Tutor
      </Title>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Nombre del Tutor
          </label>
          <Input
            type="text"
            name="nombreTutor"
            value={nuevoAlumno.nombreTutor}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            DNI del Tutor
          </label>
          <Input
            type="text"
            name="dniTutor"
            value={nuevoAlumno.dniTutor}
            onChange={handleInputChange}
          />
        </div>
      </div>
    </div>

    {/* Estilos y Descuentos */}
    <div style={{ marginBottom: '30px' }}>
      <Title style={{ fontSize: '1.2em', marginBottom: '20px' }}>
        Estilos y Descuentos
      </Title>
      
      <div style={{ display: 'grid', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Estilos *
          </label>
          <Select
            name="estilosIds"
            multiple
            value={nuevoAlumno.estilosIds}
            onChange={handleInputChange}
            required
            style={{ height: '120px' }}
          >
            {estilos.map(estilo => (
              <option key={estilo.id} value={estilo.id.toString()}>
                {estilo.nombre}
              </option>
            ))}
          </Select>
          <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
            Mantén presionado Ctrl (Cmd en Mac) para seleccionar múltiples estilos
          </small>
        </div>

        {descuentoAutomatico && (
          <div style={{ 
            padding: '10px', 
            backgroundColor: '#e6f4ea', 
            borderRadius: '4px',
            color: '#1e4620'
          }}>
            Descuento automático por múltiples estilos: {descuentoAutomatico}%
          </div>
        )}

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Descuento Manual (%)
          </label>
          <Input
            type="number"
            name="descuentoManual"
            value={nuevoAlumno.descuentoManual}
            onChange={handleInputChange}
            min="0"
            max="100"
            step="1"
          />
        </div>
      </div>
    </div>

    {/* Notas Adicionales */}
    <div style={{ marginBottom: '30px' }}>
      <Title style={{ fontSize: '1.2em', marginBottom: '20px' }}>
        Notas Adicionales
      </Title>
      
      <div>
        <TextArea
          name="notas"
          value={nuevoAlumno.notas}
          onChange={handleInputChange}
          placeholder="Información adicional relevante sobre el alumno..."
          style={{ width: '100%', minHeight: '100px' }}
        />
      </div>
    </div>

    {/* Botones de acción */}
    <div style={{ 
      borderTop: '1px solid #eee', 
      paddingTop: '20px',
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '10px'
    }}>
      <Button 
        type="button" 
        onClick={() => setMostrarFormulario(false)}
        style={{ backgroundColor: '#f0f0f0', color: '#333' }}
      >
        Cancelar
      </Button>
      <Button type="submit" disabled={loading}>
        {loading ? 'Guardando...' : 'Registrar Alumno Regular'}
      </Button>
    </div>
  </>
)}
          </Form>
        </ScrollableContainer>
      )}

      {/* Buscador y listado */}
      <FilterContainer>
        <SearchInput
          type="text"
          placeholder="Buscar por nombre, apellido o DNI..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
      </FilterContainer>

      <ScrollableContainer>
        <HorizontalScrollContainer>
          <Table>
            <thead>
              <tr>
                <Th>Nombre</Th>
                <Th>Apellido</Th>
                <Th>DNI</Th>
                <Th>Email</Th>
                <Th>Teléfono</Th>
                <Th>Tipo</Th>
                <Th>Estado</Th>
                <Th>Estilos</Th>
                <Th>Descuentos</Th>
                <Th>Acciones</Th>
              </tr>
            </thead>
            <tbody>
              {alumnosFiltrados.map((alumno) => (
                <Tr key={alumno.id}>
                  <Td>{alumno.nombre}</Td>
                  <Td>{alumno.apellido}</Td>
                  <Td>{alumno.dni}</Td>
                  <Td>{alumno.email}</Td>
                  <Td>{alumno.telefono}</Td>
                  <Td>{alumno.tipoAlumno || 'Regular'}</Td>
                  <Td>{alumno.activo ? 'Activo' : 'Inactivo'}</Td>
                  <Td>
                    <EstilosComponent
                      alumnoEstilos={alumno.alumnoEstilos}
                      onEstiloToggle={(estiloId) => handleEstiloAlumno(alumno.id, estiloId)}
                      alumnoId={alumno.id}
                    />
                  </Td>
                  <Td>
                    {alumno.descuentosVigentes?.map((d: any) => (
                      <div key={d.id}>
                        {d.descuento.esAutomatico ? 'Auto: ' : 'Manual: '}
                        {d.descuento.porcentaje}%
                      </div>
                    ))}
                  </Td>
                  <Td>
                    <ButtonGroup>
                      <Button onClick={() => setEditandoAlumno(alumno)}>
                        Editar
                      </Button>
                      <Button onClick={() => handleEstadoAlumno(alumno.id, !alumno.activo)}>
                        {alumno.activo ? 'Dar de Baja' : 'Reactivar'}
                      </Button>
                    </ButtonGroup>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </HorizontalScrollContainer>
      </ScrollableContainer>

      {/* Modal de edición */}
      {editandoAlumno && (
        <EditAlumnoModal
          alumno={editandoAlumno}
          estilos={estilos}
          onClose={() => setEditandoAlumno(null)}
          onSave={handleGuardarEdicion}
        />
      )}

      {/* Mensajes de feedback */}
      {message && (
        <Message isError={message.isError}>
          {message.text}
        </Message>
      )}
    </Container>
  </PageContainer>
);
}

export default Alumnos;