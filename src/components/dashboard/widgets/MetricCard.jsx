// src/components/dashboard/widgets/MetricCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { DollarSign } from 'lucide-react';

export const MetricCard = ({ title, value, icon, color = 'primary', to }) => {
  const Icon = icon || DollarSign;
  
  // Determine visual style based on color prop
  const colorStyles = {
    primary: { text: 'text-gray-900', icon: 'text-primary-600' },
    green: { text: 'text-gray-900', icon: 'text-alert-success' },
    orange: { text: 'text-alert-warning', icon: 'text-alert-warning' }, 
    red: { text: 'text-alert-error', icon: 'text-alert-error' },
    gray: { text: 'text-gray-500', icon: 'text-gray-400' },
  }[color] || { text: 'text-gray-900', icon: 'text-gray-500' };

  // FIX: Auto-scale font size for very large numbers
  const valueString = String(value);
  const fontSizeClass = valueString.length > 8 ? 'text-lg' : valueString.length > 6 ? 'text-xl' : 'text-2xl';

  const CardContent = () => (
    <div className="flex items-start">
      {/* FIX: Removed gray background box for a cleaner "Air" look */}
      <div className={`flex-shrink-0 flex items-center justify-center mt-1 mr-3 ${colorStyles.icon}`}>
        <Icon className="w-5 h-5" />
      </div>
      
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide leading-snug">
          {title}
        </p>
        
        <p className={`${fontSizeClass} sm:text-2xl font-bold mt-0.5 tabular-nums tracking-tight break-words ${colorStyles.text}`}>
          {value}
        </p>
      </div>
    </div>
  );

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