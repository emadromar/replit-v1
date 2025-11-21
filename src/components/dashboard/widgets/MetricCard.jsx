// src/components/dashboard/widgets/MetricCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { DollarSign } from 'lucide-react';

export const MetricCard = ({ title, value, icon, color = 'primary', to }) => {
  const Icon = icon || DollarSign;
  
  // REFACTOR: Removed background colors.
  // We only use text color for the VALUE if it indicates a specific status (like error).
  const valueColorClass = {
    primary: 'text-gray-900',
    green: 'text-gray-900', // Keep neutral to reduce noise
    orange: 'text-alert-warning', // Keep for warnings
    red: 'text-alert-error',     // Keep for errors
    gray: 'text-gray-900',
  }[color] || 'text-gray-900';

  const CardContent = () => (
    <div className="flex items-start">
      {/* 1. Neutral Icon: Gray-50 background, Gray-500 icon */}
      <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-gray-50 border border-gray-100 text-gray-500">
        <Icon className="w-5 h-5" />
      </div>
      
      <div className="ml-3 min-w-0 flex-1">
        {/* 2. Darker Label: text-gray-600 for readability */}
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide leading-snug">
          {title}
        </p>
        
        {/* 3. Mobile Optimization: 'break-words' instead of truncate to prevent cutting off large numbers */}
        <p className={`text-xl sm:text-2xl font-bold mt-0.5 tabular-nums tracking-tight break-words ${valueColorClass}`}>
          {value}
        </p>
      </div>
    </div>
  );

  // Use the global .card class we defined in Step 1
  const containerClasses = "card h-full flex flex-col justify-center transition-all duration-200";

  if (to) {
    return (
      <Link to={to} className={`${containerClasses} hover:border-primary-300 cursor-pointer group`}>
        <CardContent />
      </Link>
    );
  }

  return (
    <div className={containerClasses}>
      <CardContent />
    </div>
  );
};