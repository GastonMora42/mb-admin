// components/CtaCte/index.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

// Interfaces
interface Alumno {
  id: number;
  nombre: string;
  apellido: string;
  esAlumnoSuelto?: boolean;
  ctaCte?: {
    saldo: number;
  };
  deudas?: Deuda[];
  alumnoEstilos?: {
    estilo: {
      nombre: string;
      monto: number;
    };
  }[];
  descuentosVigentes?: {
    descuento: {
      esAutomatico: boolean;
      porcentaje: number;
    };
  }[];
}

interface Deuda {
  id: number;
  monto: number;
  montoOriginal: number;
  mes: string;
  anio: number;
  pagada: boolean;
  fechaPago: string | null;
  estilo: {
    id: number;
    nombre: string;
  };
  pagos: {
    id: number;
    monto: number;
    fecha: string;
    recibo: {
      id: number;
      numeroRecibo: number;
      fecha: string;
      monto: number;
    };
  }[];
}

interface Recibo {
  id: number;
  numeroRecibo: number;
  fecha: string;
  periodoPago: string;
  alumno?: { nombre: string; apellido: string };
  alumnoSuelto?: { nombre: string; apellido: string };
  concepto: { nombre: string };
  monto: number;
  montoOriginal: number;
  descuento?: number;
  tipoPago: string;
  pagosDeuda?: {
    monto: number;
    deuda: {
      estilo: {
        nombre: string;
      };
    };
  }[];
}

interface Estadisticas {
  totalPagado: number;
  deudaTotal: number;
  cantidadDeudas: number;
  estilosActivos: number;
  ultimoPago: string | null;
  descuentosActivos: {
    tipo: string;
    porcentaje: number;
  }[];
}

interface EstadoPagos {
  alDia: boolean;
  mesesAdeudados: string[];
}

// Styled Components
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
  padding-bottom: 10px;
  border-bottom: 2px solid #FFC001;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px;
  margin-bottom: 20px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s ease;

  &:focus {
    border-color: #FFC001;
    outline: none;
    box-shadow: 0 0 0 2px rgba(255, 192, 1, 0.1);
  }
`;

const AlumnoList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin-bottom: 20px;
  border: 1px solid #eee;
  border-radius: 6px;
  max-height: 300px;
  overflow-y: auto;
`;

const AlumnoItem = styled.li`
  padding: 12px 15px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: all 0.2s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #f5f5f5;
  }
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const DashboardCard = styled.div<{ status?: 'success' | 'warning' | 'danger' }>`
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  border-left: 4px solid ${props => {
    switch (props.status) {
      case 'success': return '#4CAF50';
      case 'warning': return '#FFC107';
      case 'danger': return '#f44336';
      default: return '#FFC001';
    }
  }};
`;

const CardTitle = styled.h4`
  margin: 0 0 10px 0;
  color: #666;
  font-size: 14px;
`;

const CardValue = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #333;
`;

const CardSubValue = styled.div`
  font-size: 14px;
  color: #666;
  margin-top: 5px;
`;

const TabsContainer = styled.div`
  margin-bottom: 20px;
`;

const TabButton = styled.button<{ active: boolean }>`
  padding: 10px 20px;
  border: none;
  background: ${props => props.active ? '#FFC001' : '#f5f5f5'};
  color: ${props => props.active ? '#000' : '#666'};
  cursor: pointer;
  margin-right: 10px;
  border-radius: 6px;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.active ? '#e6ac00' : '#eee'};
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
`;

const Th = styled.th`
  background-color: #000000;
  color: #FFFFFF;
  text-align: left;
  padding: 15px;
  font-weight: 500;
`;

const Td = styled.td`
  border-bottom: 1px solid #eee;
  padding: 15px;
`;

const Tr = styled.tr`
  &:nth-child(even) {
    background-color: #f9f9f9;
  }

  &:hover {
    background-color: #f5f5f5;
  }
`;

const TotalContainer = styled.div`
  margin-top: 20px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  text-align: right;
  font-size: 18px;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
`;

const StatusBadge = styled.span<{ status: 'success' | 'warning' | 'danger' }>`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background-color: ${props => {
    switch (props.status) {
      case 'success': return '#e8f5e9';
      case 'warning': return '#fff3e0';
      case 'danger': return '#ffebee';
      default: return '#f5f5f5';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'success': return '#2e7d32';
      case 'warning': return '#f57c00';
      case 'danger': return '#c62828';
      default: return '#666';
    }
  }};
`;
const CtaCte: React.FC = () => {
  // Estados
  const [searchTerm, setSearchTerm] = useState('');
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [selectedAlumno, setSelectedAlumno] = useState<Alumno | null>(null);
  const [recibos, setRecibos] = useState<Recibo[]>([]);
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [estadoPagos, setEstadoPagos] = useState<EstadoPagos | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'recibos' | 'deudas'>('dashboard');
  const [loading, setLoading] = useState(false);

  // Effects
  // Funciones de fetch
  const fetchAlumnos = async () => {
    try {
      const res = await fetch(`/api/ctacte?query=${searchTerm}`);
      if (res.ok) {
        const data = await res.json();
        setAlumnos(data.map((a: any) => ({
          ...a,
          esAlumnoSuelto: 'alumnoRegularId' in a
        })));
      }
    } catch (error) {
      console.error('Error fetching alumnos:', error);
    }
  };

  useEffect(() => {
    const handleSearch = async () => {
      if (searchTerm.length > 2) {
        await fetchAlumnos();
      } else {
        setAlumnos([]);
      }
    };
    
    handleSearch();
  }, [searchTerm, fetchAlumnos]); // incluimos fetchAlumnos como dependencia
  

  const fetchAlumnoInfo = async (alumnoId: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/ctacte?alumnoId=${alumnoId}`);
      if (res.ok) {
        const data = await res.json();
        console.log('Data recibida:', data); // Para debug
        setSelectedAlumno(data.alumnoInfo);
        setRecibos(data.recibos);
        setEstadisticas(data.estadisticas);
        setEstadoPagos(data.estadoPagos);
      }
    } catch (error) {
      console.error('Error fetching alumno info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAlumnoSelect = (alumno: Alumno) => {
    fetchAlumnoInfo(alumno.id);
    setSearchTerm('');
    setAlumnos([]);
  };

  // Funciones de utilidad
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Renderizado del dashboard
  const renderDashboard = () => {
    if (!estadisticas || !estadoPagos) return null;

    return (
      <DashboardGrid>
        <DashboardCard status={estadoPagos.alDia ? 'success' : 'danger'}>
          <CardTitle>Estado de Cuenta</CardTitle>
          <CardValue>
            {estadoPagos.alDia ? 'Al día' : 'Con deudas'}
          </CardValue>
          {!estadoPagos.alDia && (
            <CardSubValue>
              {estadoPagos.mesesAdeudados.length} {estadoPagos.mesesAdeudados.length === 1 ? 'mes' : 'meses'} pendientes
            </CardSubValue>
          )}
        </DashboardCard>

        <DashboardCard>
          <CardTitle>Total Pagado</CardTitle>
          <CardValue>{formatCurrency(estadisticas.totalPagado)}</CardValue>
          {estadisticas.ultimoPago && (
            <CardSubValue>
              Último pago: {formatFecha(estadisticas.ultimoPago)}
            </CardSubValue>
          )}
        </DashboardCard>

        <DashboardCard status={estadisticas.deudaTotal > 0 ? 'warning' : 'success'}>
          <CardTitle>Deuda Total</CardTitle>
          <CardValue>{formatCurrency(estadisticas.deudaTotal)}</CardValue>
          <CardSubValue>
            {estadisticas.cantidadDeudas} cuota{estadisticas.cantidadDeudas !== 1 ? 's' : ''} pendiente{estadisticas.cantidadDeudas !== 1 ? 's' : ''}
          </CardSubValue>
        </DashboardCard>

        <DashboardCard>
          <CardTitle>Estilos Activos</CardTitle>
          <CardValue>{estadisticas.estilosActivos}</CardValue>
          {estadisticas.descuentosActivos.length > 0 && (
            <CardSubValue>
              {estadisticas.descuentosActivos.map((desc, i) => (
                <div key={i}>
                  {desc.tipo}: {desc.porcentaje}% descuento
                </div>
              ))}
            </CardSubValue>
          )}
        </DashboardCard>
      </DashboardGrid>
    );
  };

  // Continúo con las funciones de renderizado y el JSX principal

 const renderRecibosTable = () => {
  return (
    <>
      <Table>
        <thead>
          <Tr>
            <Th>N° Recibo</Th>
            <Th>Fecha</Th>
            <Th>Periodo</Th>
            <Th>Concepto</Th>
            <Th>Deudas Pagadas</Th>
            <Th>Monto Original</Th>
            <Th>Descuento</Th>
            <Th>Monto Final</Th>
            <Th>Forma de Pago</Th>
          </Tr>
        </thead>
        <tbody>
          {recibos.map((recibo) => (
            <Tr key={recibo.id}>
              <Td>{recibo.numeroRecibo}</Td>
              <Td>{formatFecha(recibo.fecha)}</Td>
              <Td>{recibo.periodoPago}</Td>
              <Td>{recibo.concepto.nombre}</Td>
              <Td>
                {recibo.pagosDeuda?.map((pago, index) => (
                  <div key={index}>
                    {pago.deuda.estilo.nombre}: {formatCurrency(pago.monto)}
                  </div>
                ))}
              </Td>
              <Td>{formatCurrency(recibo.montoOriginal)}</Td>
              <Td>
                {recibo.descuento 
                  ? `${(recibo.descuento * 100).toFixed(0)}%` 
                  : '-'}
              </Td>
              <Td>{formatCurrency(recibo.monto)}</Td>
              <Td>{recibo.tipoPago}</Td>
            </Tr>
          ))}
        </tbody>
      </Table>
      <TotalContainer>
        <span>Total Pagado:</span>
        <span>{formatCurrency(estadisticas?.totalPagado || 0)}</span>
      </TotalContainer>
    </>
  );
};

const renderDeudasTable = () => {
  if (!selectedAlumno?.deudas) return null;

  // Ordenar deudas por fecha
  const ordenarDeudas = (deudas: Deuda[]) => {
    return deudas.sort((a, b) => {
      if (a.anio !== b.anio) return a.anio - b.anio;
      return parseInt(a.mes) - parseInt(b.mes);
    });
  };

  const deudasPendientes = ordenarDeudas(selectedAlumno.deudas.filter(d => !d.pagada));
  const deudasPagadas = ordenarDeudas(selectedAlumno.deudas.filter(d => d.pagada));

  console.log('Deudas pagadas:', deudasPagadas); // Para debug

  return (
    <>
      <h3>Deudas Pendientes ({deudasPendientes.length})</h3>
      <Table>
        <thead>
          <Tr>
            <Th>Estilo</Th>
            <Th>Período</Th>
            <Th>Monto</Th>
            <Th>Estado</Th>
          </Tr>
        </thead>
        <tbody>
          {deudasPendientes.map((deuda) => (
            <Tr key={deuda.id}>
              <Td>{deuda.estilo.nombre}</Td>
              <Td>{`${deuda.mes}/${deuda.anio}`}</Td>
              <Td>{formatCurrency(deuda.monto)}</Td>
              <Td>
                <StatusBadge status="danger">
                  Pendiente
                </StatusBadge>
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>

      <h3 style={{ marginTop: '30px' }}>Deudas Pagadas ({deudasPagadas.length})</h3>
      <Table>
        <thead>
          <Tr>
            <Th>Estilo</Th>
            <Th>Período</Th>
            <Th>Monto Original</Th>
            <Th>Pagos</Th>
            <Th>Fecha Pago</Th>
            <Th>Estado</Th>
          </Tr>
        </thead>
        <tbody>
          {deudasPagadas.map((deuda) => (
            <Tr key={deuda.id}>
              <Td>{deuda.estilo.nombre}</Td>
              <Td>{`${deuda.mes}/${deuda.anio}`}</Td>
              <Td>{formatCurrency(deuda.montoOriginal)}</Td>
              <Td>
                {deuda.pagos.map((pago, index) => (
                  <div key={index}>
                    <div>Recibo #{pago.recibo.numeroRecibo}</div>
                    <div>{formatCurrency(pago.monto)}</div>
                    <small>{formatFecha(pago.recibo.fecha)}</small>
                  </div>
                ))}
              </Td>
              <Td>{deuda.fechaPago ? formatFecha(deuda.fechaPago) : '-'}</Td>
              <Td>
                <StatusBadge status="success">
                  Pagada
                </StatusBadge>
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>

      {deudasPagadas.length === 0 && (
        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
          No hay deudas pagadas
        </div>
      )}
    </>
  );
};

// JSX Principal
return (
  <PageContainer>
    <Container>
      <Title>Cuenta Corriente</Title>
      
      <SearchInput
        type="text"
        placeholder="Buscar alumno por nombre o apellido..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {alumnos.length > 0 && (
        <AlumnoList>
          {alumnos.map((alumno) => (
            <AlumnoItem 
              key={alumno.id} 
              onClick={() => handleAlumnoSelect(alumno)}
            >
              {alumno.nombre} {alumno.apellido}
              {alumno.esAlumnoSuelto && 
                <StatusBadge status="warning" style={{ marginLeft: '10px' }}>
                  Suelto
                </StatusBadge>
              }
            </AlumnoItem>
          ))}
        </AlumnoList>
      )}

      {selectedAlumno && !loading && (
        <>
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ marginBottom: '10px' }}>
              {selectedAlumno.nombre} {selectedAlumno.apellido}
            </h2>
            {estadoPagos && (
              <StatusBadge 
                status={estadoPagos.alDia ? 'success' : 'danger'}
              >
                {estadoPagos.alDia ? 'Al día' : 'Con deudas pendientes'}
              </StatusBadge>
            )}
          </div>

          <TabsContainer>
            <TabButton 
              active={activeTab === 'dashboard'}
              onClick={() => setActiveTab('dashboard')}
            >
              Dashboard
            </TabButton>
            <TabButton 
              active={activeTab === 'recibos'}
              onClick={() => setActiveTab('recibos')}
            >
              Recibos
            </TabButton>
            <TabButton 
              active={activeTab === 'deudas'}
              onClick={() => setActiveTab('deudas')}
            >
              Deudas
            </TabButton>
          </TabsContainer>

          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'recibos' && renderRecibosTable()}
          {activeTab === 'deudas' && renderDeudasTable()}
        </>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          Cargando información...
        </div>
      )}
    </Container>
  </PageContainer>
);
};

export default CtaCte;