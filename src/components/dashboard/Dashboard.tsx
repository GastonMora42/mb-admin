import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import dynamic from 'next/dynamic';
import type { ChartData, ChartOptions } from 'chart.js';

// Importación dinámica de los componentes de gráficos y la configuración
const DynamicPie = dynamic(() => import('react-chartjs-2').then(mod => mod.Pie), { ssr: false });
const DynamicBar = dynamic(() => import('react-chartjs-2').then(mod => mod.Bar), { ssr: false });
const DynamicChartConfig = dynamic(() => import('./ChartConfig'), { ssr: false });


const DashboardContainer = styled.div`
  padding: 20px;
  background-color: #f5f5f5;
`;

const DashboardTitle = styled.h1`
  color: #333;
  text-align: center;
  margin-bottom: 50px;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 20px;
  margin-bottom: 50px;
`;

const MetricCard = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
`;

const MetricTitle = styled.h3`
  margin: 0;
  color: #666;
`;

const MetricValue = styled.p`
  font-size: 24px;
  font-weight: bold;
  margin: 10px 0 0;
  color: #333;
`;

const ChartContainer = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px;
`;

interface DashboardData {
  totalAlumnos: number;
  alumnosActivos: number;
  nuevoAlumnos: number;
  totalClases: number;
  totalAsistencias: number;
  ingresosMes: number;
  estilosPopulares: Array<{ nombre: string; _count: { alumnos: number } }>;
  deudaTotal: number;
  mesActual: string;
}

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/dashboard');
        const data: DashboardData = await response.json();
        setDashboardData(data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  if (!isClient || !dashboardData) return <div>Cargando...</div>;

  const estilosData: ChartData<'pie'> = {
    labels: dashboardData.estilosPopulares.map(estilo => estilo.nombre),
    datasets: [
      {
        data: dashboardData.estilosPopulares.map(estilo => estilo._count.alumnos),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
      }
    ]
  };

  const asistenciasData: ChartData<'bar'> = {
    labels: ['Asistencias', 'Ausencias'],
    datasets: [
      {
        label: 'Asistencias vs Ausencias',
        data: [dashboardData.totalAsistencias, dashboardData.totalClases * dashboardData.alumnosActivos - dashboardData.totalAsistencias],
        backgroundColor: ['#36A2EB', '#FF6384']
      }
    ]
  };

  const barOptions: ChartOptions<'bar'> = {
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <DashboardContainer>
      <DynamicChartConfig />
      <DashboardTitle>Dashboard - {dashboardData.mesActual}</DashboardTitle>
      <MetricsGrid>
        <MetricCard>
          <MetricTitle>Total Alumnos</MetricTitle>
          <MetricValue>{dashboardData.totalAlumnos}</MetricValue>
        </MetricCard>
        <MetricCard>
          <MetricTitle>Alumnos Activos</MetricTitle>
          <MetricValue>{dashboardData.alumnosActivos}</MetricValue>
        </MetricCard>
        <MetricCard>
          <MetricTitle>Nuevos Alumnos</MetricTitle>
          <MetricValue>{dashboardData.nuevoAlumnos}</MetricValue>
        </MetricCard>
        <MetricCard>
          <MetricTitle>Total Clases</MetricTitle>
          <MetricValue>{dashboardData.totalClases}</MetricValue>
        </MetricCard>
        <MetricCard>
          <MetricTitle>Ingresos del Mes</MetricTitle>
          <MetricValue>${dashboardData.ingresosMes.toFixed(2)}</MetricValue>
        </MetricCard>
        <MetricCard>
          <MetricTitle>Deuda Total</MetricTitle>
          <MetricValue>${dashboardData.deudaTotal.toFixed(2)}</MetricValue>
        </MetricCard>
      </MetricsGrid>
      <ChartContainer>
        <h2>Estilos más Populares</h2>
        <DynamicPie data={estilosData} />
      </ChartContainer>
      <ChartContainer>
        <h2>Asistencias vs Ausencias</h2>
        <DynamicBar data={asistenciasData} options={barOptions} />
      </ChartContainer>
    </DashboardContainer>
  );
};

export default Dashboard;