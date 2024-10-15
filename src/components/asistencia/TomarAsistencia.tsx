import React, { useState, useEffect, useCallback } from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import { fetchUserAttributes, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import styled from 'styled-components';

// Styled components (mantén los que ya tenías)
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

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Select = styled.select`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Input = styled.input`
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

interface Alumno {
  id: number;
  nombre: string;
  apellido: string;
}

interface AlumnoConAsistencia extends Alumno {
  asistio: boolean;
}

interface AlumnoSuelto {
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
}

interface Estilo {
  id: number;
  nombre: string;
}

const TomarAsistencia = () => {
  const userRole = useUserRole();
  const [user, setUser] = useState<any>(null);
  const [estilos, setEstilos] = useState<Estilo[]>([]);
  const [estiloSeleccionado, setEstiloSeleccionado] = useState('');
  const [alumnosRegulares, setAlumnosRegulares] = useState<Alumno[]>([]);
  const [alumnosSeleccionados, setAlumnosSeleccionados] = useState<AlumnoConAsistencia[]>([]);
  const [alumnosSueltos, setAlumnosSueltos] = useState<AlumnoSuelto[]>([]);
  const [mostrarFormularioSuelto, setMostrarFormularioSuelto] = useState(false);
  const [nuevoAlumnoSuelto, setNuevoAlumnoSuelto] = useState<AlumnoSuelto>({
    nombre: '',
    apellido: '',
    telefono: '',
    email: ''
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        const userAttributes = await fetchUserAttributes();
        setUser({ ...currentUser, ...userAttributes });
      } catch (error) {
        console.error('Error al obtener el usuario:', error);
      }
    };

    if (userRole === 'Profesor' || userRole === 'Dueño') {
      fetchUser();
      fetchEstilos();
      fetchAlumnosRegulares();
    }
  }, [userRole]);

  const fetchEstilos = async () => {
    try {
      const response = await fetch('/api/estilos');
      const data = await response.json();
      setEstilos(data);
    } catch (error) {
      console.error('Error al obtener estilos:', error);
    }
  };

  const fetchAlumnosRegulares = async () => {
    try {
      const response = await fetch('/api/alumnos');
      const data = await response.json();
      setAlumnosRegulares(data);
    } catch (error) {
      console.error('Error al obtener alumnos regulares:', error);
    }
  };

  const handleEstiloChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setEstiloSeleccionado(e.target.value);
    setAlumnosSeleccionados([]);
    setAlumnosSueltos([]);
  }, []);

  const handleAlumnoRegularChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const alumnoId = parseInt(e.target.value);
    const alumnoSeleccionado = alumnosRegulares.find(a => a.id === alumnoId);
    if (alumnoSeleccionado && !alumnosSeleccionados.some(a => a.id === alumnoId)) {
      setAlumnosSeleccionados(prev => [...prev, { ...alumnoSeleccionado, asistio: true }]);
    }
  }, [alumnosRegulares, alumnosSeleccionados]);

  const handleAsistenciaChange = useCallback((id: number, asistio: boolean) => {
    setAlumnosSeleccionados(prev => prev.map(alumno => 
      alumno.id === id ? { ...alumno, asistio } : alumno
    ));
  }, []);

  const handleNuevoAlumnoSueltoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNuevoAlumnoSuelto(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleAgregarAlumnoSuelto = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setAlumnosSueltos(prev => [...prev, nuevoAlumnoSuelto]);
    setNuevoAlumnoSuelto({ nombre: '', apellido: '', telefono: '', email: '' });
    setMostrarFormularioSuelto(false);
  }, [nuevoAlumnoSuelto]);

  const handleRemoveAlumno = useCallback((id: number) => {
    setAlumnosSeleccionados(prev => prev.filter(alumno => alumno.id !== id));
  }, []);

  const handleRemoveAlumnoSuelto = useCallback((index: number) => {
    setAlumnosSueltos(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleFinalizarClase = useCallback(async () => {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.accessToken?.toString();

      if (!token) {
        throw new Error('No se pudo obtener el token de acceso');
      }

      const datosClase = {
        profesorId: user.username,
        estiloId: parseInt(estiloSeleccionado),
        fecha: new Date().toISOString(),
        asistencias: alumnosSeleccionados.map(({ id, asistio }) => ({ alumnoId: id, asistio })),
        alumnosSueltos: alumnosSueltos
      };

      const response = await fetch('/api/registrar-clase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(datosClase),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar la clase');
      }

      alert('Clase finalizada y asistencias guardadas con éxito');
      setEstiloSeleccionado('');
      setAlumnosSeleccionados([]);
      setAlumnosSueltos([]);
    } catch (error) {
      console.error('Error al finalizar la clase:', error);
      alert(`Hubo un error al guardar la clase: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }, [user, estiloSeleccionado, alumnosSeleccionados, alumnosSueltos]);

  if (userRole !== 'Profesor' && userRole !== 'Dueño') {
    return <div>No tienes permiso para acceder a esta página.</div>;
  }

  return (
    <Container>
      <Title>Tomar Asistencia</Title>
      {user && <p>Profesor: {user.name}</p>}
      <Form>
        <Select value={estiloSeleccionado} onChange={handleEstiloChange}>
          <option value="">Selecciona un estilo</option>
          {estilos.map(estilo => (
            <option key={estilo.id} value={estilo.id}>{estilo.nombre}</option>
          ))}
        </Select>

        {estiloSeleccionado && (
          <>
            <Select onChange={handleAlumnoRegularChange}>
              <option value="">Selecciona un alumno regular</option>
              {alumnosRegulares.map(alumno => (
                <option key={alumno.id} value={alumno.id}>{`${alumno.nombre} ${alumno.apellido}`}</option>
              ))}
            </Select>

            <Button type="button" onClick={() => setMostrarFormularioSuelto(true)}>
              Agregar Alumno Suelto
            </Button>
          </>
        )}
        
        {mostrarFormularioSuelto && (
          <div>
            <Input
              type="text"
              name="nombre"
              value={nuevoAlumnoSuelto.nombre}
              onChange={handleNuevoAlumnoSueltoChange}
              placeholder="Nombre"
              required
            />
            <Input
              type="text"
              name="apellido"
              value={nuevoAlumnoSuelto.apellido}
              onChange={handleNuevoAlumnoSueltoChange}
              placeholder="Apellido"
              required
            />
            <Input
              type="tel"
              name="telefono"
              value={nuevoAlumnoSuelto.telefono}
              onChange={handleNuevoAlumnoSueltoChange}
              placeholder="Teléfono"
            />
            <Input
              type="email"
              name="email"
              value={nuevoAlumnoSuelto.email}
              onChange={handleNuevoAlumnoSueltoChange}
              placeholder="Email"
            />
            <Button type="button" onClick={handleAgregarAlumnoSuelto}>Agregar Alumno Suelto</Button>
          </div>
        )}

        {(alumnosSeleccionados.length > 0 || alumnosSueltos.length > 0) && (
          <Table>
            <thead>
              <tr>
                <Th>Nombre</Th>
                <Th>Apellido</Th>
                <Th>Tipo</Th>
                <Th>Asistió</Th>
                <Th>Acciones</Th>
              </tr>
            </thead>
            <tbody>
              {alumnosSeleccionados.map(alumno => (
                <tr key={alumno.id}>
                  <Td>{alumno.nombre}</Td>
                  <Td>{alumno.apellido}</Td>
                  <Td>Regular</Td>
                  <Td>
                    <input
                      type="checkbox"
                      checked={alumno.asistio}
                      onChange={(e) => handleAsistenciaChange(alumno.id, e.target.checked)}
                    />
                  </Td>
                  <Td>
                    <Button onClick={() => handleRemoveAlumno(alumno.id)}>Eliminar</Button>
                  </Td>
                </tr>
              ))}
              {alumnosSueltos.map((alumno, index) => (
                <tr key={index}>
                  <Td>{alumno.nombre}</Td>
                  <Td>{alumno.apellido}</Td>
                  <Td>Suelto</Td>
                  <Td>
                    <input
                      type="checkbox"
                      checked={true}
                      disabled
                    />
                  </Td>
                  <Td>
                    <Button onClick={() => handleRemoveAlumnoSuelto(index)}>Eliminar</Button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {(alumnosSeleccionados.length > 0 || alumnosSueltos.length > 0) && (
          <Button type="button" onClick={handleFinalizarClase}>
            Finalizar Clase
          </Button>
        )}
      </Form>
    </Container>
  );
};

export default TomarAsistencia;
                      