// components/Dashboard/components/PieChart.tsx
import React from 'react';
import { Pie } from 'react-chartjs-2';
import styled from 'styled-components';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
  Plugin
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const ChartContainer = styled.div`
  height: 300px;
  position: relative;
  margin: 0 auto;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

interface PieChartProps {
  data: Array<{
    label: string;
    value: number;
  }>;
}

const CHART_COLORS = [
  '#60a5fa', // azul
  '#34d399', // verde
  '#fbbf24', // amarillo
  '#f87171', // rojo
  '#a78bfa', // púrpura
  '#14b8a6', // turquesa
  '#f472b6', // rosa
  '#64748b', // gris
] as const;

const PieChart: React.FC<PieChartProps> = ({ data }) => {
  const chartData: ChartData<'pie'> = {
    labels: data.map(item => item.label),
    datasets: [
      {
        data: data.map(item => item.value),
        backgroundColor: CHART_COLORS,
        borderColor: '#ffffff',
        borderWidth: 1,
        hoverOffset: 4,
      },
    ],
  };

  const options: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: 20
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          boxWidth: 12,
          font: {
            size: 12,
          },
          usePointStyle: true,
          generateLabels: function(chart) {
            const data = chart.data;
            if (data.labels?.length && data.datasets.length) {
              const dataset = data.datasets[0];
              return data.labels.map((label, i) => ({
                text: `${label} (${dataset.data[i]})`,
                fillStyle: CHART_COLORS[i % CHART_COLORS.length],
                strokeStyle: '#fff',
                lineWidth: 1,
                hidden: false,
                index: i
              }));
            }
            return [];
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            if (context.dataset.data) {
              const total = context.dataset.data.reduce((acc, curr) => acc + (typeof curr === 'number' ? curr : 0), 0);
              const value = context.parsed;
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
              return `${context.label}: ${value} (${percentage}%)`;
            }
            return '';
          }
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14
        },
        bodyFont: {
          size: 13
        }
      }
    },
    animation: {
      duration: 500,
    },
  };

  return (
    <ChartContainer>
      <Pie data={chartData} options={options} />
    </ChartContainer>
  );
};

export default React.memo(PieChart);