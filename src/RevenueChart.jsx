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

// Register necessary Chart.js components
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

// --- FUNCTION TO PROCESS REAL ORDERS DATA ---
const generateChartData = (orders) => {
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const now = new Date();
  
  // 1. Initialize data structure for the last 7 days
  const dailyRevenue = {};
  const labels = [];
  
  for (let i = 6; i >= 0; i--) {
    const day = new Date(now.getTime() - i * MS_PER_DAY);
    // Format label for chart (e.g., Oct 20)
    const label = day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); 
    const dateKey = day.toISOString().split('T')[0];
    
    dailyRevenue[dateKey] = 0;
    labels.push(label);
  }

  // 2. Aggregate Revenue from Orders
  orders.forEach(order => {
    // Orders must have a creation date (Firestore Timestamp)
    if (order.createdAt && order.createdAt.toDate) {
      const orderDate = order.createdAt.toDate();
      const dateKey = orderDate.toISOString().split('T')[0];
      
      if (dailyRevenue.hasOwnProperty(dateKey)) {
        dailyRevenue[dateKey] += order.total || 0;
      }
    }
  });
  
  // 3. Extract the final values in correct order
  const dataKeys = Object.keys(dailyRevenue).sort();
  const revenueData = dataKeys.map(key => dailyRevenue[key]);

  return {
    labels,
    datasets: [
      {
        label: 'Daily Revenue (JOD)',
        data: revenueData,
        borderColor: 'rgb(79, 70, 229)', 
        backgroundColor: 'rgba(79, 70, 229, 0.2)', // Lighter fill
        fill: true,
        tension: 0.4, 
        pointRadius: 5,
        pointBackgroundColor: 'rgb(79, 70, 229)',
      },
    ],
  };
};

// Inside src/RevenueChart.jsx

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
  // --- UPDATED SCALES FOR BETTER READABILITY ---
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Revenue (JOD)',
      },
      grid: {
          color: 'rgba(200, 200, 200, 0.2)',
      },
      // NEW: Adjust step size and padding
      ticks: {
          // Increase step size for less dense labels (e.g., show every 10 or 20)
          stepSize: 10, 
          padding: 10, // Add padding to labels
      }
    },
    x: {
        grid: {
            display: false,
        }
    }
  },
  // --- NEW: Add padding around the chart area ---
  layout: {
      padding: {
          top: 10,
          right: 20,
          bottom: 0,
          left: 10 // Increase left padding for Y-axis numbers
      }
  }
};

export function RevenueChart({ orders }) {
  // Use useMemo here to prevent unnecessary re-runs of data processing
  const chartData = React.useMemo(() => generateChartData(orders), [orders]);

  return (
    <div style={{ height: '300px', width: '100%' }}>
        <Line options={options} data={chartData} />
    </div>
  );
}