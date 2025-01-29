// components/Dashboard/index.tsx
import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion'; // Removemos AnimatePresence ya que no lo necesitamos aquí
import { 
  LineChart, 
  PieChart, 
  BarChart, 
  MetricCard, 
  LoadingSkeleton,
  MediosPagoChart 
} from './components';
import { formatCurrency } from '@/utils/format';
import { DashboardData } from '@/types/dashboard';

// Ajustamos el Grid para diferentes layouts según el contenido
const Grid = styled.div<{ columns?: number }>`
  display: grid;
  grid-template-columns: ${props => props.columns ? `repeat(${props.columns}, 1fr)` : 'repeat(auto-fit, minmax(300px, 1fr))'};
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;


const SectionTitle = styled.h2`
  color: #334155;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #f1f5f9;
`;

const ChartContainer = styled.div`
  flex: 1;
  position: relative;
  min-height: 0;
`;

const DashboardContainer = styled.div`
  padding: 2rem;
  background-color: #f8fafc;
  min-height: 100vh;
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const HeaderInfo = styled.div``;

const Title = styled.h1`
  color: #1e293b;
  font-size: 2rem;
  font-weight: 600;
  margin: 0;
`;

const Subtitle = styled.p`
  color: #64748b;
  font-size: 1rem;
  margin: 0.5rem 0 0;
`;

const LastUpdate = styled.p`
  color: #94a3b8;
  font-size: 0.875rem;
`;



const Section = styled(motion.div)`
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  height: 100%;
  max-height: 800px; // Añadimos altura máxima
  overflow: hidden; // Prevenimos desbordamiento
`;



const variants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5, // Duración específica
      ease: "easeOut"
    }
  }
};

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout>();
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    
    const fetchData = async () => {
      if (!mounted.current) return;
      
      try {
        const response = await fetch('/api/dashboard');
        if (!response.ok) throw new Error('Error al cargar los datos');
        const dashboardData = await response.json();
        if (mounted.current) {
          setData(dashboardData);
          setError(null);
        }
      } catch (err) {
        if (mounted.current) {
          setError(err instanceof Error ? err.message : 'Error desconocido');
        }
      } finally {
        if (mounted.current) {
          setLoading(false);
        }
      }
    };

    fetchData();

    intervalRef.current = setInterval(fetchData, 5 * 60 * 1000);

    return () => {
      mounted.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  if (loading) return <LoadingSkeleton />;
  if (error) return <div>Error: {error}</div>;
  if (!data) return null;

  const { metricas, rankings, periodo, ultimaActualizacion } = data;


  return (
    <DashboardContainer>
      <DashboardHeader>
        <HeaderInfo>
          <Title>Dashboard de estadísticas</Title>
          <Subtitle>
            {periodo.mes.charAt(0).toUpperCase() + periodo.mes.slice(1)} {periodo.anio} En MB Academia de danzas
          </Subtitle>
        </HeaderInfo>
        <LastUpdate>
          Última actualización: {new Date(ultimaActualizacion).toLocaleString()}
        </LastUpdate>
      </DashboardHeader>

      {/* Métricas principales - 4 columnas */}
      <Grid columns={4}>
        <MetricCard
          title="Alumnos Activos"
          value={metricas.alumnos.activos}
          delta={metricas.alumnos.tasaCrecimiento}
          icon="👥"
        />
        <MetricCard
          title="Alumnos Sueltos del Mes"
          value={metricas.alumnos.sueltos}
          icon="🎯"
        />
        <MetricCard
          title="Clases del Mes"
          value={metricas.clases.total}
          delta={metricas.clases.tasaAsistencia}
          icon="📚"
        />
        <MetricCard
          title="Ingresos del Mes"
          value={formatCurrency(metricas.finanzas.ingresos)}
          delta={metricas.finanzas.tasaCobranza}
          icon="💰"
        />
      </Grid>

      {/* Gráficos principales - 2 columnas */}
      <Grid columns={2}>
        <Section
          variants={variants}
          initial="initial"
          animate="animate"
          whileHover={{ 
            scale: 1.01,
            transition: { 
              duration: 0.2,
              type: "spring",
              stiffness: 300,
              damping: 20
            }
          }}
        >
          <SectionTitle>Estilos Populares</SectionTitle>
          <ChartContainer>
            <PieChart
              data={rankings.estilosPopulares.map(estilo => ({
                label: estilo.nombre,
                value: estilo._count.alumnoEstilos
              }))}
            />
          </ChartContainer>
        </Section>

        <Section
          variants={variants}
          initial="initial"
          animate="animate"
        >
          <SectionTitle>Medios de Pago</SectionTitle>
          <ChartContainer>
            <MediosPagoChart mediosPago={metricas.finanzas.mediosPago} />
          </ChartContainer>
        </Section>
      </Grid>

      {/* Rankings - 2 columnas, altura completa */}
      <Grid columns={2}>
        <Section >
          <SectionTitle>Top Profesores del Mes</SectionTitle>
          <ChartContainer>
            <BarChart
              data={rankings.profesores.map(profesor => ({
                label: `${profesor.nombre} ${profesor.apellido}`,
                value: profesor._count.clases
              }))}
              axisLabel="Cantidad de Clases"
            />
          </ChartContainer>
        </Section>

        <Section >
          <SectionTitle>Top Alumnos por Asistencia</SectionTitle>
          <ChartContainer>
            <BarChart
              data={rankings.alumnosAsistencia.map(alumno => ({
                label: `${alumno.nombre} ${alumno.apellido}`,
                value: alumno._count.asistencias
              }))}
              axisLabel="Cantidad de Asistencias"
            />
          </ChartContainer>
        </Section>
      </Grid>

      {/* Métricas Financieras - ancho completo */}
      <Grid>
        <Section>
          <SectionTitle>Resumen Financiero</SectionTitle>
          <ChartContainer>
            <LineChart
              data={{
                labels: ['Ingresos', 'Deudas Mes', 'Deudas Totales'],
                values: [
                  metricas.finanzas.ingresos,
                  metricas.finanzas.deudasMes,
                  metricas.finanzas.deudasTotales
                ]
              }}
              axisLabel="Monto en Pesos"
            />
          </ChartContainer>
        </Section>
      </Grid>
    </DashboardContainer>
  );
};

export default Dashboard;