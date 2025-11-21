// src/components/dashboard/widgets/MetricCard.jsx
import React from 'react';
import { DollarSign } from 'lucide-react';

export const MetricCard = ({ title, value, icon, color = 'primary' }) => {
  const Icon = icon || DollarSign;
  const colorClass = {
    primary: 'text-primary-700',
    green: 'text-alert-success',
    orange: 'text-alert-warning',
  }[color];
  
  const bgClass = {
    primary: 'bg-primary-50',
    green: 'bg-green-50',
    orange: 'bg-orange-50',
  }[color];

  return (
    <div className={`card p-4 sm:p-5 ${bgClass}`}>
      <div className="flex items-center">
        <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-white`}>
          <Icon className={`w-5 h-5 ${colorClass}`} />
        </div>
        <div className="ml-3 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">{title}</p>
          <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{value}</p>
        </div>
      </div>
    </div>
  );
};