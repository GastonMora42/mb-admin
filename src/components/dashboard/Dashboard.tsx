import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, 
  PieChart, 
  BarChart, 
  MetricCard, 
  LoadingSkeleton,
  MediosPagoChart 
} from './components';
import { formatCurrency } from '@/utils/format';

// Styled Components
const DashboardContainer = styled.div`
  padding: 1rem;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
  
  @media (min-width: 768px) {
    padding: 2rem;
  }
`;

const Header = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
`;

const HeaderTop = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  
  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const Title = styled.h1`
  color: #1e293b;
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  
  @media (min-width: 768px) {
    font-size: 2.25rem;
  }
`;

const MonthNavigator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #f1f5f9;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  flex-wrap: wrap;
  
  @media (min-width: 768px) {
    flex-wrap: nowrap;
  }
`;

const MonthButton = styled.button<{ isActive?: boolean }>`
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  
  ${props => props.isActive ? `
    background: #FFC001;
    color: #1a202c;
    box-shadow: 0 2px 4px rgba(255, 192, 1, 0.3);
  ` : `
    background: white;
    color: #64748b;
    
    &:hover {
      background: #e2e8f0;
      color: #475569;
    }
  `}
`;

const NavButton = styled.button`
  background: white;
  border: 1px solid #e2e8f0;
  color: #64748b;
  padding: 0.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const FiltersContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-top: 1.5rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FilterLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
`;

const FilterSelect = styled.select`
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
    border-color: #FFC001;
    box-shadow: 0 0 0 3px rgba(255, 192, 1, 0.1);
  }
`;

const Grid = styled.div<{ columns?: number }>`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
  
  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: ${props => props.columns ? `repeat(${Math.min(props.columns, 3)}, 1fr)` : 'repeat(3, 1fr)'};
  }
  
  @media (min-width: 1440px) {
    grid-template-columns: ${props => props.columns ? `repeat(${props.columns}, 1fr)` : 'repeat(auto-fit, minmax(280px, 1fr))'};
  }
`;

const Section = styled(motion.div)`
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  height: 100%;
  position: relative;
  overflow: hidden;
`;

const SectionTitle = styled.h2`
  color: #334155;
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #f1f5f9;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ChartContainer = styled.div`
  flex: 1;
  position: relative;
  min-height: 300px;
  
  @media (min-width: 768px) {
    min-height: 350px;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  
  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StatItem = styled.div`
  background: #f8fafc;
  padding: 1rem;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
`;

const StatLabel = styled.p`
  color: #64748b;
  font-size: 0.875rem;
  margin: 0 0 0.25rem;
`;

const StatValue = styled.p`
  color: #1e293b;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
`;

const InfoIcon = styled.span`
  cursor: help;
  color: #64748b;
  font-size: 0.875rem;
`;

const Tooltip = styled.div<{ show: boolean }>`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: #1e293b;
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  white-space: nowrap;
  z-index: 10;
  opacity: ${props => props.show ? 1 : 0};
  visibility: ${props => props.show ? 'visible' : 'hidden'};
  transition: all 0.2s ease;
  
  &::before {
    content: '';
    position: absolute;
    top: -4px;
    left: 50%;
    transform: translateX(-50%);
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-bottom: 4px solid #1e293b;
  }
`;

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
`;

const ErrorMessage = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 1rem;
  border-radius: 0.75rem;
  text-align: center;
`;

// Interface para los datos del dashboard
interface DashboardData {
  metricas: {
    alumnos: {
      activos: number;
      nuevos: number;
      inactivos: number;
      sueltos: number;
      bajas: number;
      inscripciones: number;
      tasaCrecimiento: string;
    };
    clases: {
      total: number;
      asistencias: number;
      tasaAsistencia: string;
    };
    finanzas: {
      ingresos: number;
      deudasMes: number;
      deudasTotales: number;
      tasaCobranza: string;
      mediosPago: Record<string, { monto: number; cantidad: number }>;
      cuotasRegularesPagadas: number;
    };
  };
  rankings: {
    estilosPopulares: Array<{
      nombre: string;
      _count: { alumnoEstilos: number };
    }>;
    profesores: Array<{
      nombre: string;
      apellido: string;
      _count: { clases: number };
    }>;
    alumnosAsistencia: Array<{
      nombre: string;
      apellido: string;
      _count: { asistencias: number };
    }>;
  };
  periodo: {
    mes: string;
    anio: number;
  };
  ultimaActualizacion: string;
}

interface Filters {
  profesor: string;
  estilo: string;
  tipoPago: string;
}

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filters, setFilters] = useState<Filters>({
    profesor: '',
    estilo: '',
    tipoPago: ''
  });
  const [tooltips, setTooltips] = useState<Record<string, boolean>>({});
  const intervalRef = useRef<NodeJS.Timeout>();

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    intervalRef.current = interval;
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [currentDate, filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        year: currentDate.getFullYear().toString(),
        month: (currentDate.getMonth() + 1).toString(),
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      });
      
      const response = await fetch(`/api/dashboard?${params}`);
      if (!response.ok) throw new Error('Error al cargar los datos');
      
      const dashboardData = await response.json();
      setData(dashboardData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToMonth = (monthIndex: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(monthIndex);
      return newDate;
    });
  };

  const isCurrentMonth = () => {
    const today = new Date();
    return currentDate.getFullYear() === today.getFullYear() && 
           currentDate.getMonth() === today.getMonth();
  };

  const showTooltip = (key: string) => {
    setTooltips(prev => ({ ...prev, [key]: true }));
  };

  const hideTooltip = (key: string) => {
    setTooltips(prev => ({ ...prev, [key]: false }));
  };

  const getTooltipText = (metric: string): string => {
    const tooltipTexts: Record<string, string> = {
      'alumnos-activos': 'Cantidad de alumnos con estado activo en el sistema',
      'alumnos-sueltos': 'Alumnos que tomaron clases individuales este mes',
      'inscripciones': 'Nuevas inscripciones procesadas este mes',
      'cuotas-pagadas': 'Cantidad de cuotas mensuales pagadas',
      'clases-mes': 'Total de clases dictadas en el período',
      'bajas': 'Alumnos dados de baja en este mes',
      'ingresos': 'Total de dinero recaudado en el período',
      'tasa-crecimiento': 'Porcentaje de crecimiento respecto al mes anterior',
      'tasa-asistencia': 'Porcentaje de asistencia promedio a las clases',
      'tasa-cobranza': 'Porcentaje de deudas cobradas vs generadas'
    };
    return tooltipTexts[metric] || 'Información adicional';
  };

  if (loading && !data) return <LoadingSkeleton />;
  if (error) return <ErrorMessage>Error: {error}</ErrorMessage>;
  if (!data) return null;

  const { metricas, rankings, periodo } = data;

  return (
    <DashboardContainer>
      <Header>
        <HeaderTop>
          <Title>Dashboard MB Estudio de Danzas ✨💃</Title>
          <MonthNavigator>
            <NavButton onClick={() => navigateMonth('prev')}>
              ←
            </NavButton>
            <MonthButton isActive={isCurrentMonth()} onClick={() => setCurrentDate(new Date())}>
              Actual
            </MonthButton>
            <span style={{ color: '#64748b', fontWeight: '600' }}>
              {months[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <NavButton onClick={() => navigateMonth('next')}>
              →
            </NavButton>
          </MonthNavigator>
        </HeaderTop>

        <FiltersContainer>
          <FilterGroup>
            <FilterLabel>Profesor</FilterLabel>
            <FilterSelect 
              value={filters.profesor} 
              onChange={(e) => setFilters(prev => ({ ...prev, profesor: e.target.value }))}
            >
              <option value="">Todos los profesores</option>
              {/* Aquí irían las opciones dinámicas */}
            </FilterSelect>
          </FilterGroup>
          
          <FilterGroup>
            <FilterLabel>Estilo</FilterLabel>
            <FilterSelect 
              value={filters.estilo} 
              onChange={(e) => setFilters(prev => ({ ...prev, estilo: e.target.value }))}
            >
              <option value="">Todos los estilos</option>
              {/* Aquí irían las opciones dinámicas */}
            </FilterSelect>
          </FilterGroup>
          
          <FilterGroup>
            <FilterLabel>Tipo de Pago</FilterLabel>
            <FilterSelect 
              value={filters.tipoPago} 
              onChange={(e) => setFilters(prev => ({ ...prev, tipoPago: e.target.value }))}
            >
              <option value="">Todos los tipos</option>
              <option value="EFECTIVO">Efectivo</option>
              <option value="MERCADO_PAGO">Mercado Pago</option>
              <option value="TRANSFERENCIA">Transferencia</option>
              <option value="DEBITO_AUTOMATICO">Débito Automático</option>
            </FilterSelect>
          </FilterGroup>
        </FiltersContainer>
      </Header>

      {/* Métricas principales */}
      <Grid columns={6}>
        <div style={{ position: 'relative' }}>
          <MetricCard
            title="Alumnos Activos"
            value={metricas.alumnos.activos}
            delta={metricas.alumnos.tasaCrecimiento}
            icon="👥"
          />
          <InfoIcon 
            onMouseEnter={() => showTooltip('alumnos-activos')}
            onMouseLeave={() => hideTooltip('alumnos-activos')}
          >
            ℹ️
          </InfoIcon>
          <Tooltip show={tooltips['alumnos-activos']}>
            {getTooltipText('alumnos-activos')}
          </Tooltip>
        </div>

        <div style={{ position: 'relative' }}>
          <MetricCard
            title="Alumnos Sueltos"
            value={metricas.alumnos.sueltos}
            icon="🎯"
          />
          <InfoIcon 
            onMouseEnter={() => showTooltip('alumnos-sueltos')}
            onMouseLeave={() => hideTooltip('alumnos-sueltos')}
          >
            ℹ️
          </InfoIcon>
          <Tooltip show={tooltips['alumnos-sueltos']}>
            {getTooltipText('alumnos-sueltos')}
          </Tooltip>
        </div>

        <div style={{ position: 'relative' }}>
          <MetricCard
            title="Inscripciones"
            value={metricas.alumnos.inscripciones}
            icon="✍️"
          />
          <InfoIcon 
            onMouseEnter={() => showTooltip('inscripciones')}
            onMouseLeave={() => hideTooltip('inscripciones')}
          >
            ℹ️
          </InfoIcon>
          <Tooltip show={tooltips['inscripciones']}>
            {getTooltipText('inscripciones')}
          </Tooltip>
        </div>

        <div style={{ position: 'relative' }}>
          <MetricCard
            title="Cuotas Pagadas"
            value={metricas.finanzas.cuotasRegularesPagadas}
            icon="📝"
          />
          <InfoIcon 
            onMouseEnter={() => showTooltip('cuotas-pagadas')}
            onMouseLeave={() => hideTooltip('cuotas-pagadas')}
          >
            ℹ️
          </InfoIcon>
          <Tooltip show={tooltips['cuotas-pagadas']}>
            {getTooltipText('cuotas-pagadas')}
          </Tooltip>
        </div>

        <div style={{ position: 'relative' }}>
          <MetricCard
            title="Clases del Mes"
            value={metricas.clases.total}
            delta={metricas.clases.tasaAsistencia}
            icon="📚"
          />
          <InfoIcon 
            onMouseEnter={() => showTooltip('clases-mes')}
            onMouseLeave={() => hideTooltip('clases-mes')}
          >
            ℹ️
          </InfoIcon>
          <Tooltip show={tooltips['clases-mes']}>
            {getTooltipText('clases-mes')}
          </Tooltip>
        </div>

        <div style={{ position: 'relative' }}>
          <MetricCard
            title="Ingresos"
            value={formatCurrency(metricas.finanzas.ingresos)}
            delta={metricas.finanzas.tasaCobranza}
            icon="💰"
          />
          <InfoIcon 
            onMouseEnter={() => showTooltip('ingresos')}
            onMouseLeave={() => hideTooltip('ingresos')}
          >
            ℹ️
          </InfoIcon>
          <Tooltip show={tooltips['ingresos']}>
            {getTooltipText('ingresos')}
          </Tooltip>
        </div>
      </Grid>

      {/* Gráficos principales */}
      <Grid columns={2}>
        <Section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <SectionTitle>
            🎭 Estilos Populares
            <InfoIcon 
              onMouseEnter={() => showTooltip('estilos-populares')}
              onMouseLeave={() => hideTooltip('estilos-populares')}
            >
              ℹ️
            </InfoIcon>
            <Tooltip show={tooltips['estilos-populares']}>
              Distribución de alumnos por estilo de danza
            </Tooltip>
          </SectionTitle>
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <SectionTitle>
            💳 Medios de Pago
            <InfoIcon 
              onMouseEnter={() => showTooltip('medios-pago')}
              onMouseLeave={() => hideTooltip('medios-pago')}
            >
              ℹ️
            </InfoIcon>
            <Tooltip show={tooltips['medios-pago']}>
              Distribución de ingresos por tipo de pago
            </Tooltip>
          </SectionTitle>
          <ChartContainer>
            <MediosPagoChart mediosPago={metricas.finanzas.mediosPago} />
          </ChartContainer>
        </Section>
      </Grid>

      {/* Rankings */}
      <Grid columns={2}>
        <Section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <SectionTitle>
            👩‍🏫 Top Profesores
            <InfoIcon 
              onMouseEnter={() => showTooltip('top-profesores')}
              onMouseLeave={() => hideTooltip('top-profesores')}
            >
              ℹ️
            </InfoIcon>
            <Tooltip show={tooltips['top-profesores']}>
              Profesores con más clases dictadas este mes
            </Tooltip>
          </SectionTitle>
          <ChartContainer>
            <BarChart
              data={rankings.profesores.map(profesor => ({
                label: `${profesor.nombre} ${profesor.apellido}`,
                value: profesor._count.clases
              }))}
              axisLabel="Clases Dictadas"
            />
          </ChartContainer>
        </Section>

        <Section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <SectionTitle>
            🏆 Top Asistencia
            <InfoIcon 
              onMouseEnter={() => showTooltip('top-asistencia')}
              onMouseLeave={() => hideTooltip('top-asistencia')}
            >
              ℹ️
            </InfoIcon>
            <Tooltip show={tooltips['top-asistencia']}>
              Alumnos con mayor asistencia a clases
            </Tooltip>
          </SectionTitle>
          <ChartContainer>
            <BarChart
              data={rankings.alumnosAsistencia.map(alumno => ({
                label: `${alumno.nombre} ${alumno.apellido}`,
                value: alumno._count.asistencias
              }))}
              axisLabel="Asistencias"
            />
          </ChartContainer>
        </Section>
      </Grid>

      {/* Resumen financiero detallado */}
      <Section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <SectionTitle>
          📊 Resumen Financiero Detallado
        </SectionTitle>
        <StatsGrid>
          <StatItem>
            <StatLabel>Ingresos del Mes</StatLabel>
            <StatValue>{formatCurrency(metricas.finanzas.ingresos)}</StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>Deudas del Mes</StatLabel>
            <StatValue>{formatCurrency(metricas.finanzas.deudasMes)}</StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>Deudas Pendientes Totales</StatLabel>
            <StatValue>{formatCurrency(metricas.finanzas.deudasTotales)}</StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>Tasa de Cobranza</StatLabel>
            <StatValue>{metricas.finanzas.tasaCobranza}%</StatValue>
          </StatItem>
        </StatsGrid>
      </Section>
    </DashboardContainer>
  );
};

export default Dashboard;