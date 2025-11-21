// src/components/dashboard/widgets/AiCoachCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, MessageSquare } from 'lucide-react';
import { LockedFeatureCard } from '../../shared/LockedFeatureCard.jsx';

export const AiCoachCard = ({ onOpenUpgradeModal, currentPlanId, topProducts, orders = [] }) => {
  const hasPro = currentPlanId === 'pro';

  if (!hasPro) {
    return (
      <LockedFeatureCard
        title="AI Sales Coach"
        description="Unlock smart, conversational insights and suggestions."
        icon={MessageSquare}
        planName="Pro"
        onUpgrade={onOpenUpgradeModal}
      />
    );
  }
  
  // Logic remains the same...
  const lowStockProduct = topProducts.find(p => p.salesCount > 0 && p.stock < 5);
  let trendMessage = "Data is stable.";
  if (orders.length > 0) {
     const recentRevenue = orders.slice(0, 5).reduce((sum, o) => sum + (o.total || 0), 0);
     if (recentRevenue > 0) {
         trendMessage = "Sales are flowing! Your recent orders look healthy. Keep pushing your top products on Instagram.";
     } else {
         trendMessage = "It's quiet today. Try creating a Flash Sale coupon to boost activity.";
     }
  } else {
      trendMessage = "Waiting for your first sale. Have you shared your store link on social media yet?";
  }
  const insightMessage = lowStockProduct 
    ? `Your top-selling product, **${lowStockProduct.name}**, is critically low with **${lowStockProduct.stock} units** left. RESTOCK URGENTLY!`
    : trendMessage;

  return (
    <motion.div 
      className="card card-padding relative bg-indigo-50 border border-indigo-100 overflow-hidden"
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <h2 className="card-header text-indigo-900">
        <Sparkles className="w-5 h-5 mr-2 text-indigo-600" />
        AI Sales Coach
      </h2>
      
      <div className="mt-4 space-y-3">
        <div className="flex items-start">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-white"/>
          </div>
          <div className="ml-3 p-3 bg-white rounded-xl shadow-sm border border-gray-100 relative">
              <p className="text-sm text-gray-800 leading-relaxed" 
                 dangerouslySetInnerHTML={{ __html: insightMessage.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} 
              />
          </div>
        </div>
        
        <div className='ml-11'>
            <button className="text-xs font-semibold text-indigo-700 hover:underline">
                View More Insights →
            </button>
        </div>
      </div>
    </motion.div>
  );
};