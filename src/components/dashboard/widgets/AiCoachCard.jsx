// src/components/dashboard/widgets/AiCoachCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Lock } from 'lucide-react';

export const AiCoachCard = ({ onOpenUpgradeModal, currentPlanId, topProducts, orders = [] }) => {
  const hasPro = currentPlanId === 'pro';

  // Calculate the insight regardless of plan (so we can generate the teaser)
  const lowStockProduct = topProducts.find(p => p.salesCount > 0 && p.stock < 5);
  let insightMessage = "";
  
  if (orders.length > 0) {
     const recentRevenue = orders.slice(0, 5).reduce((sum, o) => sum + (o.total || 0), 0);
     if (recentRevenue > 0) {
         insightMessage = "Sales are flowing! Your recent orders look healthy.";
     } else {
         insightMessage = "It's quiet today. Try creating a Flash Sale coupon.";
     }
  } else {
      insightMessage = "Waiting for your first sale. Share your store link!";
  }

  if (lowStockProduct) {
      insightMessage = `Urgent: Your top product ${lowStockProduct.name} is running out.`;
  }

  // --- LOCKED STATE: The "Curiosity Gap" ---
  if (!hasPro) {
    return (
      <motion.div 
        className="card relative overflow-hidden group cursor-pointer"
        onClick={onOpenUpgradeModal}
        whileHover={{ y: -2 }}
      >
        <div className="p-5">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-indigo-900 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-indigo-500" />
                    AI Coach
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded">
                    Pro
                </span>
            </div>
            
            {/* Blurry Content */}
            <div className="relative">
                <p className="text-sm text-gray-400 blur-[3px] select-none leading-relaxed">
                    Based on your sales patterns, we recommend launching a BOGO campaign on Tuesday to maximize revenue. Your inventory for...
                </p>
                
                {/* Overlay Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <button className="bg-white/90 backdrop-blur-sm border border-indigo-100 shadow-sm text-indigo-700 text-xs font-bold px-4 py-2 rounded-full flex items-center hover:bg-indigo-50 transition-colors">
                        <Lock className="w-3 h-3 mr-1.5" />
                        Unlock AI Insights
                    </button>
                </div>
            </div>
        </div>
      </motion.div>
    );
  }
  
  // --- UNLOCKED STATE ---
  return (
    <motion.div 
      className="card relative bg-gradient-to-br from-white to-indigo-50/50 border-indigo-100"
      whileHover={{ y: -2 }}
    >
      <div className="p-5">
        <h2 className="text-lg font-semibold text-indigo-900 flex items-center mb-4">
            <Sparkles className="w-5 h-5 mr-2 text-indigo-600" />
            AI Coach
        </h2>
        
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white border border-indigo-100 flex items-center justify-center shadow-sm">
             <Sparkles className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="p-3 bg-white rounded-tr-xl rounded-br-xl rounded-bl-xl border border-indigo-100 shadow-sm">
              <p className="text-sm text-gray-700 leading-relaxed" 
                 dangerouslySetInnerHTML={{ __html: insightMessage.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} 
              />
          </div>
        </div>
      </div>
    </motion.div>
  );
};