// src/components/dashboard/widgets/MetricCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { DollarSign } from 'lucide-react';

export const MetricCard = ({ title, value, icon, color = 'primary', to }) => {
  const Icon = icon || DollarSign;
  
  const styles = {
    primary: { text: 'text-primary-700', bg: 'bg-primary-50', border: 'border-primary-100' },
    green: { text: 'text-alert-success', bg: 'bg-green-50', border: 'border-green-100' },
    orange: { text: 'text-alert-warning', bg: 'bg-orange-50', border: 'border-orange-100' },
    red: { text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-100' },
    gray: { text: 'text-gray-600', bg: 'bg-white', border: 'border-gray-100' },
  }[color] || styles.primary;

  const CardContent = () => (
    <div className="flex items-center">
      <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-white border border-transparent shadow-sm ${styles.text}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="ml-3 min-w-0">
        <p className="text-xs sm:text-sm font-medium text-gray-500 truncate uppercase tracking-wide">{title}</p>
        {/* FIX: Added 'tabular-nums' and 'tracking-tight' for professional financial display */}
        <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate tabular-nums tracking-tight">{value}</p>
      </div>
    </div>
  );

  const containerClasses = `card p-4 sm:p-5 border transition-all duration-200 ${styles.bg} ${styles.border}`;

  if (to) {
    return (
      <Link to={to} className={`${containerClasses} hover:shadow-md hover:-translate-y-0.5 cursor-pointer block`}>
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