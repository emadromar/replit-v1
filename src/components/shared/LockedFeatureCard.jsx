// src/components/shared/LockedFeatureCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

/**
 * The new "Frosted" locked card.
 * This component is used for all plan-gated features.
 */
export const LockedFeatureCard = ({ title, description, icon, planName, onUpgrade }) => {
  const Icon = icon || Lock;
  const planColorClass = planName === 'Basic' ? 'text-subscription-basic' : 'text-subscription-pro';
  const planBorderClass = planName === 'Basic' ? 'border-subscription-basic' : 'border-subscription-pro';

  return (
    <motion.div 
      className="card p-6 flex flex-col items-center justify-center text-center relative overflow-hidden"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Frosted Overlay Effect */}
      <div className="absolute inset-0 bg-white/30 backdrop-blur-sm z-10" />
      
      {/* Blurred background content */}
      <div className="absolute inset-0 opacity-40 blur-md">
        <Icon className="w-24 h-24 text-gray-200 absolute -right-4 -bottom-4" />
        <div className="w-3/4 h-2 bg-gray-200 rounded-full mt-8 ml-6" />
        <div className="w-1/2 h-2 bg-gray-200 rounded-full mt-2 ml-6" />
      </div>

      {/* Foreground Content (on top of the frost) */}
      <div className="relative z-20 flex flex-col items-center">
        <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-white border-2 ${planBorderClass}`}>
          <Icon className={`h-6 w-6 ${planColorClass}`} />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
        <button
          onClick={onUpgrade}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-800"
        >
          <Lock className="w-4 h-4" />
          {`Unlock with ${planName}`}
        </button>
      </div>
    </motion.div>
  );
};