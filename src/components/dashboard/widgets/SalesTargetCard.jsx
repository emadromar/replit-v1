// src/components/dashboard/widgets/SalesTargetCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { LockedFeatureCard } from '../../shared/LockedFeatureCard.jsx';
import { CURRENCY_CODE } from '../../../config.js';
export const SalesTargetCard = ({ store, totalRevenue, onOpenUpgradeModal, currentPlanId }) => {
  const hasBasic = currentPlanId === 'basic' || currentPlanId === 'pro';

  if (!hasBasic) {
    return (
      <LockedFeatureCard
        title="Sales Target"
        description="Set monthly goals to visually track your revenue progress."
        icon={Zap}
        planName="Basic"
        onUpgrade={onOpenUpgradeModal}
      />
    );
  }

  const target = store?.monthlyTarget || 0;
  const revenue = parseFloat(totalRevenue) || 0;
  const percentage = target > 0 ? Math.min(100, (revenue / target) * 100) : 0;

  return (
    <motion.div 
      className="card card-hover p-6 flex flex-col justify-between"
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Sales Target</h2>
        {target > 0 ? (
          <>
            <p className="text-3xl font-bold text-gray-900">
              ${CURRENCY_CODE} {revenue.toFixed(2)}
            </p>
            <p className="text-sm font-medium text-gray-500">
              of {`${CURRENCY_CODE} ${target.toFixed(2)}`} goal
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
              <motion.div
                className="bg-alert-success h-2.5 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
            </div>
            <div className="flex justify-between text-xs font-semibold text-gray-500 mt-1">
              <span>0%</span>
              <span>{percentage.toFixed(0)}%</span>
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-500 mb-4">
            Set a monthly goal to track your sales progress.
          </p>
        )}
      </div>
      <Link
        to="/dashboard/settings/general"
        className="mt-4 text-sm font-semibold text-primary-700 hover:text-primary-800 transition-colors self-start"
      >
        {target > 0 ? 'Adjust Target →' : 'Set Monthly Target →'}
      </Link>
    </motion.div>
  );
};