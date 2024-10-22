// components/Dashboard/components/BarChart.tsx
import React from 'react';
import { Bar } from 'react-chartjs-2';
import styled from 'styled-components';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ChartContainer = styled.div`
  height: 100%;
  width: 100%;
  position: relative;
`;

interface BarChartProps {
  data: Array<{
    label: string;
    value: number;
  }>;
  axisLabel?: string; // Hacemos el axisLabel opcional
}

const BarChart: React.FC<BarChartProps> = ({ data, axisLabel = '' }) => {
  const chartData = {
    labels: data.map(item => item.label),
    datasets: [
      {
        data: data.map(item => item.value),
        backgroundColor: '#60a5fa',
        borderColor: '#2563eb',
        borderWidth: 1,
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
          label: (context: any) => `${axisLabel}: ${context.parsed.y}`
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
        }
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      }
    }
  };

  return (
    <ChartContainer>
      <Bar data={chartData} />
    </ChartContainer>
  );
};

export default React.memo(BarChart);