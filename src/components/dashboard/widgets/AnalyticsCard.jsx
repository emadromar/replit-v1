// src/components/dashboard/widgets/AnalyticsCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, AlertCircle, DollarSign, Package } from 'lucide-react';
import { LockedFeatureCard } from '../../shared/LockedFeatureCard.jsx';
import { RevenueChart } from '../../../RevenueChart.jsx';
import { MetricCard } from './MetricCard.jsx'; // Import the new MetricCard
import { CURRENCY_CODE } from '../../../config.js';

export const AnalyticsCard = ({ currentPlanId, orders, proAnalytics, onOpenUpgradeModal }) => {
  const hasPro = currentPlanId === 'pro';

  if (!hasPro) {
      return (
            <LockedFeatureCard
              title="Advanced Analytics"
              description="Unlock detailed sales metrics, revenue charts, and average order value data."
              icon={TrendingUp}
              planName="Pro"
              onUpgrade={onOpenUpgradeModal}
            />
      );
  }
  
  return (
      <motion.div 
        className="card p-6"
        whileHover={{ y: -5 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <h2 className="text-xl font-semibold mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-primary-700" />
            Sales Analytics
        </h2>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 border-b border-gray-100 pb-4 mb-4">
            <MetricCard title="Pending Revenue" value={`${CURRENCY_CODE} ${proAnalytics.pendingRevenue}`} icon={AlertCircle} color="orange" />
            <MetricCard title="Total Revenue" value={`${CURRENCY_CODE} ${proAnalytics.totalRevenue}`} icon={DollarSign} color="green" />
            <MetricCard title="Total Orders" value={proAnalytics.totalOrders} icon={Package} color="primary" />
            <MetricCard title="Avg. Order Value" value={`${CURRENCY_CODE} ${proAnalytics.averageOrderValue}`} icon={DollarSign} color="primary" />
        </div>
        
        <div className="mt-4 h-[350px]">
            <RevenueChart orders={orders} />
        </div>
      </motion.div>
  );
};