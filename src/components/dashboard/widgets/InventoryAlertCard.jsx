// src/components/dashboard/widgets/InventoryAlertCard.jsx
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { LockedFeatureCard } from '../../shared/LockedFeatureCard.jsx';

export const InventoryAlertCard = ({ products, onOpenUpgradeModal, currentPlanId }) => {
  const hasBasic = currentPlanId === 'basic' || currentPlanId === 'pro';

  if (!hasBasic) {
    return (
      <LockedFeatureCard
        title="Inventory Alerts"
        description="Get instant alerts when your products are running low."
        icon={AlertTriangle}
        planName="Basic"
        onUpgrade={onOpenUpgradeModal}
      />
    );
  }

  const lowStockProducts = useMemo(() => {
    return products.filter((p) => p.stock > 0 && p.stock <= 5);
  }, [products]);

  if (lowStockProducts.length === 0) {
    return (
      <motion.div 
        className="card p-6 flex flex-col justify-center"
        whileHover={{ y: -5 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <div className="flex items-center">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-green-50">
            <CheckCircle className="w-5 h-5 text-alert-success" />
          </div>
          <div className="ml-4">
            <p className="text-lg font-semibold text-gray-900">Stock Levels Good</p>
            <p className="text-sm text-gray-500">All products are well-stocked.</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="card p-6 bg-orange-50 border-2 border-alert-warning"
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <h2 className="text-lg font-semibold text-gray-900 flex items-center">
        <AlertTriangle className="w-5 h-5 mr-2 text-alert-warning" />
        Low Stock Warning
      </h2>
      <p className="text-sm text-gray-600 mt-2 mb-4">
        You have <strong className="text-alert-warning">{lowStockProducts.length} product(s)</strong> running low.
      </p>
      <ul className="space-y-2 max-h-24 overflow-y-auto pr-2">
        {lowStockProducts.map((p) => (
          <li key={p.id} className="flex justify-between items-center text-sm">
            <span className="font-medium text-gray-700 truncate" title={p.name}>
              {p.name}
            </span>
            <span className="font-bold text-alert-warning ml-2 flex-shrink-0">
              {p.stock} left
            </span>
          </li>
        ))}
      </ul>
      <Link
        to="/dashboard/products"
        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-alert-warning px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-orange-600"
      >
        Restock Now →
      </Link>
    </motion.div>
  );
};