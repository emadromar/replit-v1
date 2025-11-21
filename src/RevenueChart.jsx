// src/RevenueChart.jsx

import React, { useRef, useEffect, useState } from 'react'; // FIX: Added hooks
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

export function RevenueChart({ orders, days = 7 }) {
  const chartRef = useRef(null);
  const [chartData, setChartData] = useState({ datasets: [] });

  useEffect(() => {
    const MS_PER_DAY = 24 * 60 * 60 * 1000;
    const now = new Date();
    
    const dailyRevenue = {};
    const labels = [];
    
    // Generate Labels & Keys
    for (let i = days - 1; i >= 0; i--) {
      const day = new Date(now.getTime() - i * MS_PER_DAY);
      const label = day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); 
      const dateKey = day.toISOString().split('T')[0];
      
      dailyRevenue[dateKey] = 0;
      labels.push(label);
    }

    // Populate Data
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

    // Create Gradient
    const chart = chartRef.current;
    let backgroundStyle = 'rgba(79, 70, 229, 0.1)'; // Fallback

    if (chart) {
      const ctx = chart.ctx;
      const gradient = ctx.createLinearGradient(0, 0, 0, 300);
      gradient.addColorStop(0, 'rgba(79, 70, 229, 0.4)'); // Top color (stronger)
      gradient.addColorStop(1, 'rgba(79, 70, 229, 0.0)'); // Bottom color (transparent)
      backgroundStyle = gradient;
    }

    setChartData({
      labels,
      datasets: [
        {
          label: `Revenue (${CURRENCY_CODE})`, 
          data: revenueData,
          borderColor: '#4f46e5', // Primary-600
          backgroundColor: backgroundStyle,
          fill: true,
          tension: 0.4, 
          pointRadius: days > 14 ? 0 : 4, // Hide dots on long ranges for cleaner look
          pointHoverRadius: 6,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#4f46e5',
          pointBorderWidth: 2,
        },
      ],
    });

  }, [orders, days]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#f3f4f6',
        bodyColor: '#ffffff',
        padding: 12,
        cornerRadius: 8,
        displayColors: false, // Hide the colored square in tooltip
        callbacks: {
          label: (context) => `${CURRENCY_CODE} ${context.parsed.y.toFixed(2)}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#f3f4f6', borderDash: [5, 5] },
        ticks: { font: { size: 10 }, color: '#9ca3af', maxTicksLimit: 5 },
        border: { display: false }
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 }, color: '#9ca3af', maxTicksLimit: days > 14 ? 6 : 7 },
        border: { display: false }
      }
    },
    layout: { padding: { top: 10, right: 0, bottom: 0, left: 0 } },
    interaction: { mode: 'index', intersect: false },
  };

  return (
    <div style={{ height: '100%', width: '100%', minHeight: '250px' }}>
        <Line ref={chartRef} options={options} data={chartData} />
    </div>
  );
}