import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { fetchAuthSession } from 'aws-amplify/auth';

const Container = styled.div`
  padding: 20px;
  background-color: #FFFFFF;
`;

const SectionTitle = styled.h2`
  color: #000000;
  font-size: 1.8em;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 40px 0 20px;
  padding-bottom: 10px;
  border-bottom: 3px solid #FFC001;
  display: inline-block;
  position: relative;

  &:after {
    content: '';
    position: absolute;
    bottom: -3px;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(to right, #FFC001 0%, #FFC001 80%, transparent 100%);
  }
`;

const Title = styled.h2`
  color: #000000;
  margin-bottom: 20px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
`;

const Th = styled.th`
  background-color: #000000;
  color: #FFFFFF;
  padding: 12px;
  text-align: left;
`;

const Td = styled.td`
  padding: 12px;
  border-bottom: 1px solid #F9F8F8;
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

const DeleteButton = styled(Button)`
  background-color: #ff4d4d;
  color: white;
  &:hover {
    background-color: #ff3333;
  }
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-right: 10px;
`;

const ExpandButton = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.2em;
`;

interface AlumnoSuelto {
    id: number;
    nombre: string;
    apellido: string;
    telefono: string;
    email: string;
    createdAt: string;
  }
  
  interface Clase {
    id: number;
    fecha: string;
    profesor: {
      nombre: string;
      apellido: string;
    };
    estilo: {
      nombre: string;
    };
    asistencias: {
      id: number;
      asistio: boolean;
      alumno: {
        nombre: string;
        apellido: string;
      };
    }[];
    alumnosSueltos: {
      id: number;
      nombre: string;
      apellido: string;
    }[];
  }

const AlumnosSueltosAsistencia: React.FC = () => {
  const [alumnosSueltos, setAlumnosSueltos] = useState<AlumnoSuelto[]>([]);
  const [clases, setClases] = useState<Clase[]>([]);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [expandedClases, setExpandedClases] = useState<number[]>([]);

  const fetchData = useCallback(async (type: 'alumnos-sueltos' | 'clases') => {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.accessToken?.toString();

      if (!token) {
        throw new Error('No se pudo obtener el token de acceso');
      }

      let url = `/api/alumnos-sueltos-asistencia?type=${type}`;
      if (type === 'clases' && fechaInicio && fechaFin) {
        url += `&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener los datos');
      }

      const data = await response.json();
      if (type === 'alumnos-sueltos') {
        setAlumnosSueltos(data);
      } else {
        setClases(data);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al obtener los datos');
    }
  }, [fechaInicio, fechaFin]);

  useEffect(() => {
    fetchData('alumnos-sueltos');
  }, [fetchData]);

  const handleDelete = async (id: number, type: 'alumno-suelto' | 'clase') => {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.accessToken?.toString();

      if (!token) {
        throw new Error('No se pudo obtener el token de acceso');
      }

      const response = await fetch(`/api/alumnos-sueltos-asistencia?type=${type}&id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar');
      }

      if (type === 'alumno-suelto') {
        setAlumnosSueltos(prev => prev.filter(alumno => alumno.id !== id));
      } else {
        setClases(prev => prev.filter(clase => clase.id !== id));
      }

      alert('Eliminado con éxito');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar');
    }
  };

  const toggleExpand = (claseId: number) => {
    setExpandedClases(prev => 
      prev.includes(claseId) 
        ? prev.filter(id => id !== claseId)
        : [...prev, claseId]
    );
  };

  return (
    <Container>
      <SectionTitle>Alumnos Sueltos</SectionTitle>
      <Table>
        <thead>
          <tr>
            <Th>Nombre</Th>
            <Th>Apellido</Th>
            <Th>Teléfono</Th>
            <Th>Email</Th>
            <Th>Fecha de Creación</Th>
            <Th>Acciones</Th>
          </tr>
        </thead>
        <tbody>
          {alumnosSueltos.map(alumno => (
            <tr key={alumno.id}>
              <Td>{alumno.nombre}</Td>
              <Td>{alumno.apellido}</Td>
              <Td>{alumno.telefono}</Td>
              <Td>{alumno.email}</Td>
              <Td>{new Date(alumno.createdAt).toLocaleDateString()}</Td>
              <Td>
                <DeleteButton onClick={() => handleDelete(alumno.id, 'alumno-suelto')}>Eliminar</DeleteButton>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>

      <SectionTitle>Clases dictadas</SectionTitle>
      <div>
        <Input
          type="date"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
        />
        <Input
          type="date"
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
        />
        <Button onClick={() => fetchData('clases')}>Buscar</Button>
      </div>
      <Table>
        <thead>
          <tr>
            <Th>Fecha</Th>
            <Th>Profesor</Th>
            <Th>Estilo</Th>
            <Th>Alumnos</Th>
            <Th>Acciones</Th>
          </tr>
        </thead>
        <tbody>
          {clases.map(clase => (
            <React.Fragment key={clase.id}>
              <tr>
                <Td>{new Date(clase.fecha).toLocaleDateString()}</Td>
                <Td>{`${clase.profesor.nombre} ${clase.profesor.apellido}`}</Td>
                <Td>{clase.estilo.nombre}</Td>
                <Td>
                  <ExpandButton onClick={() => toggleExpand(clase.id)}>
                    {expandedClases.includes(clase.id) ? '▼' : '▶'}
                  </ExpandButton>
                  {clase.asistencias.length + clase.alumnosSueltos.length} alumnos
                </Td>
                <Td>
                  <DeleteButton onClick={() => handleDelete(clase.id, 'clase')}>Eliminar</DeleteButton>
                </Td>
              </tr>
              {expandedClases.includes(clase.id) && (
                <tr>
                  <Td colSpan={5}>
                    <Table>
                      <thead>
                        <tr>
                          <Th>Alumno</Th>
                          <Th>Tipo</Th>
                          <Th>Asistió</Th>
                        </tr>
                      </thead>
                      <tbody>
                        {clase.asistencias.map(asistencia => (
                          <tr key={asistencia.id}>
                            <Td>{`${asistencia.alumno.nombre} ${asistencia.alumno.apellido}`}</Td>
                            <Td>Regular</Td>
                            <Td>{asistencia.asistio ? 'Sí' : 'No'}</Td>
                          </tr>
                        ))}
                        {clase.alumnosSueltos.map(alumnoSuelto => (
                          <tr key={alumnoSuelto.id}>
                            <Td>{`${alumnoSuelto.nombre} ${alumnoSuelto.apellido}`}</Td>
                            <Td>Suelto</Td>
                            <Td>Sí</Td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default AlumnosSueltosAsistencia;