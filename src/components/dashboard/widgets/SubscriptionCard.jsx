// src/components/dashboard/widgets/SubscriptionCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, ChevronRight } from 'lucide-react';

export const SubscriptionCard = ({ currentPlanId, planDetails, onOpenUpgradeModal, className = "" }) => {
  // Simplified colors - less noise
  const badgeClass = {
    free: 'bg-gray-100 text-gray-700',
    basic: 'bg-blue-100 text-blue-700',
    pro: 'bg-purple-100 text-purple-700',
  }[currentPlanId];

  return (
    <motion.div 
      className={`card p-6 flex flex-col justify-center cursor-pointer hover:border-primary-300 transition-colors ${className}`}
      onClick={onOpenUpgradeModal}
      whileHover={{ y: -2 }}
    >
        <div className="flex items-center justify-between mb-4">
             <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Current Plan</p>
             <div className="flex items-center text-sm font-medium text-primary-700">
                {currentPlanId === 'free' ? 'Upgrade' : 'Manage'}
                <ChevronRight className="w-4 h-4 ml-1" />
            </div>
        </div>
        
      <div className="flex items-center">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${badgeClass} mr-4`}>
          <CreditCard className="w-6 h-6" />
        </div>
        <div>
          <p className="text-2xl font-extrabold text-gray-900">{planDetails.name}</p>
          <p className="text-sm text-gray-500">
              {currentPlanId === 'free' ? 'Limited Features' : 'Active Subscription'}
          </p>
        </div>
      </div>
    </motion.div>
  );
};