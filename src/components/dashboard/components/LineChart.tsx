// components/Dashboard/components/LineChart.tsx
import React from 'react';
import { Line } from 'react-chartjs-2';
import styled from 'styled-components';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ChartContainer = styled.div`
  height: 100%;
  width: 100%;
  position: relative;
`;

interface LineChartProps {
  data: {
    labels: string[];
    values: number[];
  };
  axisLabel?: string;
}

const LineChart: React.FC<LineChartProps> = ({ data, axisLabel = '' }) => {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: axisLabel,
        data: data.values,
        borderColor: '#60a5fa',
        backgroundColor: 'rgba(96, 165, 250, 0.1)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${axisLabel}: ${context.parsed.y.toLocaleString('es-AR', {
            style: 'currency',
            currency: 'ARS'
          })}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: axisLabel,
          font: {
            size: 12,
            weight: 'bold'
          },
          padding: {
            bottom: 10
          }
        },
        ticks: {
          callback: (value: number) => value.toLocaleString('es-AR', {
            style: 'currency',
            currency: 'ARS'
          })
        }
      }
    }
  };

  return (
    <ChartContainer>
      <Line data={chartData} />
    </ChartContainer>
  );
};

export default React.memo(LineChart);