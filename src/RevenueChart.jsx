// src/RevenueChart.jsx

import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// --- 1. FIX: Import the Currency Code ---
import { CURRENCY_CODE } from './config.js'; 

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const generateChartData = (orders) => {
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const now = new Date();
  
  const dailyRevenue = {};
  const labels = [];
  
  for (let i = 6; i >= 0; i--) {
    const day = new Date(now.getTime() - i * MS_PER_DAY);
    const label = day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); 
    const dateKey = day.toISOString().split('T')[0];
    
    dailyRevenue[dateKey] = 0;
    labels.push(label);
  }

  orders.forEach(order => {
    if (order.createdAt && order.createdAt.toDate) {
      const orderDate = order.createdAt.toDate();
      const dateKey = orderDate.toISOString().split('T')[0];
      
      if (dailyRevenue.hasOwnProperty(dateKey)) {
        dailyRevenue[dateKey] += order.total || 0;
      }
    }
  });
  
  const dataKeys = Object.keys(dailyRevenue).sort();
  const revenueData = dataKeys.map(key => dailyRevenue[key]);

  return {
    labels,
    datasets: [
      {
        // --- 2. FIX: Use Backticks for Variable ---
        label: `Daily Revenue (${CURRENCY_CODE})`, 
        data: revenueData,
        borderColor: 'rgb(79, 70, 229)', 
        backgroundColor: 'rgba(79, 70, 229, 0.2)',
        fill: true,
        tension: 0.4, 
        pointRadius: 5,
        pointBackgroundColor: 'rgb(79, 70, 229)',
      },
    ],
  };
};

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Last 7 Days Revenue Trend',
      font: {
        size: 14,
        weight: '600'
      }
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        // --- 3. FIX: Update Axis Label with Backticks ---
        text: `Revenue (${CURRENCY_CODE})`,
      },
      grid: {
          color: 'rgba(200, 200, 200, 0.2)',
      },
      ticks: {
          stepSize: 10, 
          padding: 10,
      }
    },
    x: {
        grid: {
            display: false,
        }
    }
  },
  layout: {
      padding: {
          top: 10,
          right: 20,
          bottom: 0,
          left: 10
      }
  }
};

export function RevenueChart({ orders }) {
  const chartData = React.useMemo(() => generateChartData(orders), [orders]);

  return (
    <div style={{ height: '300px', width: '100%' }}>
        <Line options={options} data={chartData} />
    </div>
  );
}