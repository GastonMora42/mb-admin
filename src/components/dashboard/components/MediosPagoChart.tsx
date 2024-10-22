// components/Dashboard/components/MediosPagoChart.tsx
import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import styled from 'styled-components';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const ChartContainer = styled.div`
  position: relative;
  height: 300px;
  margin-bottom: 1rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const StatCard = styled.div`
  background: #f8fafc;
  padding: 0.75rem;
  border-radius: 0.5rem;
  text-align: center;
`;

const StatLabel = styled.p`
  color: #64748b;
  font-size: 0.875rem;
  margin: 0;
`;

const StatValue = styled.p`
  color: #1e293b;
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0.25rem 0 0;
`;

interface MediosPagoChartProps {
  mediosPago: {
    [key: string]: {
      monto: number;
      cantidad: number;
    };
  };
}

const formatMedioPago = (medio: string): string => {
  const formatos: { [key: string]: string } = {
    EFECTIVO: 'Efectivo',
    MERCADO_PAGO: 'Mercado Pago',
    TRANSFERENCIA: 'Transferencia',
    DEBITO_AUTOMATICO: 'Débito Automático',
    OTRO: 'Otro'
  };
  return formatos[medio] || medio;
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(value);
};

const CHART_COLORS = {
  EFECTIVO: '#60a5fa',
  MERCADO_PAGO: '#34d399',
  TRANSFERENCIA: '#fbbf24',
  DEBITO_AUTOMATICO: '#f87171',
  OTRO: '#a78bfa'
};

const MediosPagoChart: React.FC<MediosPagoChartProps> = ({ mediosPago }) => {
  const labels = Object.keys(mediosPago).map(formatMedioPago);
  const montos = Object.values(mediosPago).map(v => v.monto);
  const cantidades = Object.values(mediosPago).map(v => v.cantidad);
  
  const data: ChartData<'doughnut'> = {
    labels,
    datasets: [
      {
        data: montos,
        backgroundColor: Object.keys(mediosPago).map(key => CHART_COLORS[key as keyof typeof CHART_COLORS] || '#cbd5e1'),
        borderWidth: 1,
        borderColor: '#fff',
      }
    ]
  };

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            size: 12
          },
          padding: 20
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => (a as number) + (b as number), 0) as number;
            const percentage = total > 0 ? ((value as number / total) * 100).toFixed(1) : '0';
            return `${label}: ${formatCurrency(value as number)} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '70%'
  };

  const totalMonto = montos.reduce((a, b) => a + b, 0);
  const totalCantidad = cantidades.reduce((a, b) => a + b, 0);

  return (
    <div>
      <ChartContainer>
        <Doughnut data={data} options={options} />
      </ChartContainer>
      
      <StatsGrid>
        <StatCard>
          <StatLabel>Total Recaudado</StatLabel>
          <StatValue>{formatCurrency(totalMonto)}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>Total Transacciones</StatLabel>
          <StatValue>{totalCantidad}</StatValue>
        </StatCard>
      </StatsGrid>

      {/* Detalle por medio de pago */}
      <StatsGrid>
        {Object.entries(mediosPago).map(([medio, { monto, cantidad }]) => (
          <StatCard key={medio}>
            <StatLabel>{formatMedioPago(medio)}</StatLabel>
            <StatValue>{formatCurrency(monto)}</StatValue>
            <StatLabel>({cantidad} transacciones)</StatLabel>
          </StatCard>
        ))}
      </StatsGrid>
    </div>
  );
};

export default MediosPagoChart;