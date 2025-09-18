import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Paper, Typography } from '@mui/material';
import { MonthlyEarning } from '../services/reportService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface EarningsChartProps {
  data: MonthlyEarning[];
}

const EarningsChart: React.FC<EarningsChartProps> = ({ data }) => {
  const chartData = {
    labels: data.map(d => d.month),
    datasets: [
      {
        label: 'Monthly Earnings',
        data: data.map(d => d.earnings),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Monthly Earnings Over Last 12 Months',
      },
    },
  };

  return (
    <Paper sx={{ p: 2, mt: 3 }}>
      <Bar options={options} data={chartData} />
    </Paper>
  );
};

export default EarningsChart;
