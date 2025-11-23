// src/components/shared/LockedFeatureCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Sparkles } from 'lucide-react';

export const LockedFeatureCard = ({ title, description, icon: Icon, planName, onUpgrade }) => {
  const planColorClass = planName === 'Basic' ? 'text-subscription-basic' : 'text-subscription-pro';
  const btnBgClass = planName === 'Basic' ? 'bg-subscription-basic' : 'bg-subscription-pro';

  return (
    <motion.div 
      className="card p-0 relative overflow-hidden group cursor-pointer h-full"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      onClick={onUpgrade}
    >
      {/* 1. The "Simulated Content" (Blurred Background) */}
      <div className="p-6 filter blur-[3px] opacity-30 select-none grayscale transition-all duration-500 group-hover:blur-[2px] group-hover:opacity-40 group-hover:grayscale-0">
         <div className="flex items-center justify-between mb-4">
            <div className="h-5 w-1/3 bg-gray-300 rounded"></div>
            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
         </div>
         <div className="space-y-3">
            <div className="h-4 w-full bg-gray-200 rounded"></div>
            <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
            <div className="h-24 w-full bg-gray-100 rounded-lg border border-gray-200 mt-4"></div>
         </div>
      </div>

      {/* 2. The "Call to Action" Overlay (Clear & Sharp) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-6 text-center bg-white/40 backdrop-blur-[1px] transition-colors group-hover:bg-white/30">
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-lg mb-4 transform transition-transform group-hover:scale-110 group-hover:-rotate-3`}>
          <Icon className={`h-7 w-7 ${planColorClass}`} />
        </div>
        
        <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-600 mb-5 leading-relaxed max-w-xs mx-auto">{description}</p>
        
        <button
          className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:scale-105 active:scale-95 ${btnBgClass}`}
        >
          <Lock className="w-3.5 h-3.5" />
          Unlock with {planName}
        </button>
        
        {/* Loss Aversion Tag */}
        <div className="mt-3 flex items-center text-[10px] font-semibold text-gray-500 bg-white/80 px-2 py-1 rounded-full shadow-sm">
           <Sparkles className="w-3 h-3 mr-1 text-yellow-500" />
           <span>Recommended by top merchants</span>
        </div>
      </div>
    </motion.div>
  );
};