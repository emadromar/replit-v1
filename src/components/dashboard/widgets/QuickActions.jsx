// src/components/dashboard/widgets/QuickActions.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, ShoppingBag, Percent, ChevronRight } from 'lucide-react';

export function QuickActions() {
  const actions = [
    { 
      label: 'Add Product', 
      icon: Plus, 
      to: '/dashboard/products', 
      color: 'bg-blue-50 text-blue-700 border-blue-100',
      desc: 'Inventory'
    },
    { 
      label: 'View Orders', 
      icon: ShoppingBag, 
      to: '/dashboard/orders', 
      color: 'bg-purple-50 text-purple-700 border-purple-100',
      desc: 'Sales'
    },
    { 
      label: 'Discount', 
      icon: Percent, 
      to: '/dashboard/marketing', 
      color: 'bg-orange-50 text-orange-700 border-orange-100',
      desc: 'Promotions'
    },
  ];

  return (
    // FIX: Horizontal scroll on mobile (flex), Grid on desktop (md:grid)
    <div className="flex md:grid md:grid-cols-3 gap-3 mb-8 overflow-x-auto pb-2 md:pb-0 scrollbar-hide mask-linear-fade-mobile">
      {actions.map((action) => (
        <Link 
          key={action.label} 
          to={action.to}
          className="min-w-[240px] md:min-w-0 flex-1 card p-3 md:p-4 flex items-center justify-between hover:shadow-md transition-all group border border-gray-100 bg-white"
        >
          <div className="flex items-center gap-3 md:gap-4">
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center border ${action.color}`}>
              <action.icon className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm md:text-base">{action.label}</h3>
              <p className="text-xs text-gray-500">{action.desc}</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-300 group-hover:text-primary-600 transition-colors" />
        </Link>
      ))}
    </div>
  );
}