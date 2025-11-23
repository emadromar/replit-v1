// src/components/dashboard/widgets/StatsRow.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, BarChart3, AlertCircle, ArrowRight, DollarSign, Package } from 'lucide-react';
import { CURRENCY_CODE } from '../../../config.js';
import { MetricCard } from './MetricCard.jsx';
import { motion } from 'framer-motion';

export const StatsRow = ({ proAnalytics, pendingOrdersCount, timeRangeLabel }) => {
  return (
    <motion.div 
      key={timeRangeLabel} 
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
    >
      {/* Revenue */}
      <MetricCard 
        title={timeRangeLabel} 
        value={`${CURRENCY_CODE} ${proAnalytics.totalRevenue}`}
        icon={TrendingUp}
        color="green"
        to="/dashboard/orders"
      />
      
      {/* Orders */}
      <MetricCard 
        title="Total Orders"
        value={proAnalytics.totalOrders}
        icon={BarChart3}
        color="primary"
        to="/dashboard/orders"
      />
      
      {/* Avg Order Value */}
      <MetricCard 
        title="Avg. Order Value"
        value={`${CURRENCY_CODE} ${proAnalytics.averageOrderValue}`}
        icon={DollarSign}
        color="primary"
      />
      
      {/* Pending Actions (Highlighted) */}
      <Link 
        to="/dashboard/orders?status=PENDING" 
        className={`p-5 rounded-xl border shadow-sm flex items-center transition-all hover:shadow-md hover:-translate-y-0.5 ${
            pendingOrdersCount > 0 
            ? 'bg-orange-50 border-orange-100' 
            : 'bg-white border-gray-200'
        }`}
      >
         <div className={`mr-3 flex-shrink-0 ${
             pendingOrdersCount > 0 ? 'text-orange-600' : 'text-gray-400'
         }`}>
            {pendingOrdersCount > 0 ? <AlertCircle className="w-6 h-6" /> : <Package className="w-6 h-6" />}
         </div>
         <div className="min-w-0 flex-1">
            <p className={`text-xs font-bold uppercase truncate ${
                pendingOrdersCount > 0 ? 'text-orange-800' : 'text-gray-500'
            }`}>
              Pending Orders
            </p>
            <div className="flex items-center justify-between mt-0.5">
              <p className={`text-2xl font-bold tabular-nums ${
                  pendingOrdersCount > 0 ? 'text-orange-700' : 'text-gray-700'
              }`}>
                {pendingOrdersCount}
              </p>
              {pendingOrdersCount > 0 && <ArrowRight className="w-4 h-4 text-orange-400" />}
            </div>
         </div>
      </Link>
    </motion.div>
  );
};