// src/components/dashboard/widgets/TopProductsCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import { LockedFeatureCard } from '../../shared/LockedFeatureCard.jsx';
import { ProductImage } from '../../../ProductImage.jsx';

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

  if (topProducts.length === 0) {
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
      className="card p-6"
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
        <BarChart3 className="w-5 h-5 mr-2 text-primary-700"/> Top Selling Products
      </h3>
      <ul className="space-y-4">
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
                <span className='text-primary-700'>Sold: <strong>{product.salesCount}</strong> units</span>
                <span className='text-alert-success'>Revenue: <strong>${CURRENCY_CODE} {product.totalRevenue.toFixed(2)}</strong></span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}