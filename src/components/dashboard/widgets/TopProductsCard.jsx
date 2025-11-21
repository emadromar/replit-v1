// src/components/dashboard/widgets/TopProductsCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LockedFeatureCard } from '../../shared/LockedFeatureCard.jsx';
import { ProductImage } from '../../../ProductImage.jsx';
import { CURRENCY_CODE } from '../../../config.js';

export function TopProductsCard({ topProducts, onOpenUpgradeModal, currentPlanId }) {
  const hasPro = currentPlanId === 'pro';

  if (!hasPro) {
    return (
      <LockedFeatureCard
        title="Top Selling Products"
        description="See your best-performing products at a glance."
        icon={BarChart3}
        planName="Pro"
        onUpgrade={onOpenUpgradeModal}
      />
    );
  }

  if (!topProducts || topProducts.length === 0) {
    return (
      <motion.div 
        className="card p-6 flex flex-col justify-center h-full min-h-[300px]"
        whileHover={{ y: -5 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <BarChart3 className="w-10 h-10 mx-auto text-gray-400 mb-3"/>
        <h3 className="text-lg font-semibold mb-1 text-gray-900 text-center">
            No Sales Data
        </h3>
        <p className="text-sm text-gray-500 text-center">
            Analytics are based on **completed orders**.
        </p>
      </motion.div>
    );
  }
    
  return (
    <motion.div 
      className="card p-6 flex flex-col h-full"
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
        <BarChart3 className="w-5 h-5 mr-2 text-primary-700"/> Top Selling Products
      </h3>
      <ul className="space-y-4 flex-1">
        {/* CRITICAL FIX: Added 'index' to the map arguments below */}
        {topProducts.map((product, index) => (
          <li key={product.id} className="flex items-center space-x-3 border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
            <span className="text-xl font-bold text-primary-700 w-6 flex-shrink-0">
              {index + 1}.
            </span>
            <ProductImage 
              src={product.imageUrl} 
              alt={product.name} 
              className="w-12 h-12 rounded-lg object-cover flex-shrink-0 bg-gray-100" 
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 truncate text-sm" title={product.name}>{product.name}</p>
              <div className="flex justify-between text-xs text-gray-500 mt-0.5">
                {/* FIX: Hidden on small mobile, visible on sm+ */}
                <span className='text-primary-700 hidden sm:inline'>Sold: <strong>{product.salesCount}</strong></span>
                
                {/* Revenue always visible, uses tabular-nums */}
                <span className='text-alert-success tabular-nums'>
                    {/* On mobile just show price, on desktop show label */}
                    <span className="hidden sm:inline">Rev: </span>
                    <strong>${CURRENCY_CODE} {product.totalRevenue.toFixed(2)}</strong>
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
      
      <div className="mt-4 pt-3 border-t border-gray-50">
        <Link to="/dashboard/products" className="flex items-center justify-center text-sm font-medium text-gray-500 hover:text-primary-600 transition-colors">
            View Full Inventory <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
    </motion.div>
  );
}