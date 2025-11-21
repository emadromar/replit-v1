// src/components/dashboard/widgets/InventoryAlertCard.jsx
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Lock, ShieldCheck } from 'lucide-react';

export const InventoryAlertCard = ({ products, onOpenUpgradeModal, currentPlanId }) => {
  const hasBasic = currentPlanId === 'basic' || currentPlanId === 'pro';

  // 1. Calculate data (We need this to decide WHICH teaser to show)
  const lowStockProducts = useMemo(() => {
    return products.filter((p) => p.stock > 0 && p.stock <= 5);
  }, [products]);

  const outOfStockProducts = useMemo(() => {
    return products.filter((p) => p.stock === 0);
  }, [products]);

  const alertCount = lowStockProducts.length + outOfStockProducts.length;

  // --- FREE PLAN LOGIC (ALWAYS GATED) ---
  if (!hasBasic) {
    // Scenario A: User has actual inventory risks (High Urgency Teaser)
    if (alertCount > 0) {
      return (
        <motion.div 
          className="card p-5 border-l-4 border-alert-warning bg-orange-50/30"
          whileHover={{ y: -2 }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center">
               <AlertTriangle className="w-5 h-5 text-alert-warning mr-2" />
               <h3 className="font-semibold text-gray-900">Inventory Risk</h3>
            </div>
            <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-1 rounded-full">
              {alertCount} Issues
            </span>
          </div>
          
          <p className="text-sm text-gray-600 mt-2 mb-3">
            We detected <strong>{alertCount} items</strong> that are low or out of stock. Upgrade to see which ones and prevent lost sales.
          </p>

          <button
            onClick={onOpenUpgradeModal}
            className="w-full flex items-center justify-center px-4 py-2.5 bg-white border border-orange-200 rounded-lg text-sm font-bold text-orange-700 hover:bg-orange-50 transition-colors shadow-sm"
          >
            <Lock className="w-3 h-3 mr-2" />
            Unlock Inventory Report
          </button>
        </motion.div>
      );
    }

    // Scenario B: Everything is fine (Feature Awareness Teaser)
    // We DO NOT show "Healthy". We show "Monitoring is active but locked".
    return (
        <motion.div 
          className="card p-6 flex flex-col items-center text-center justify-center bg-gray-50 border-dashed border-2 border-gray-200"
          whileHover={{ y: -2 }}
        >
           <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center mb-3 shadow-sm text-gray-400">
              <ShieldCheck className="w-6 h-6" />
           </div>
           <h3 className="font-semibold text-gray-900">Inventory Protection</h3>
           <p className="text-sm text-gray-500 mt-1 mb-4 max-w-[220px] leading-relaxed">
             Get automatic alerts when stock runs low so you never miss a sale.
           </p>
           <button
            onClick={onOpenUpgradeModal}
            className="btn-secondary-sm w-full"
          >
            Unlock Protection
          </button>
        </motion.div>
    );
  }

  // --- BASIC/PRO PLAN LOGIC (UNLOCKED) ---
  
  // 2. Good State
  if (alertCount === 0) {
    return (
      <motion.div 
        className="card flex flex-col justify-center items-center text-center py-8"
        whileHover={{ y: -2 }}
      >
        <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-3">
          <CheckCircle className="w-6 h-6 text-alert-success" />
        </div>
        <p className="text-sm font-semibold text-gray-900">Inventory Healthy</p>
        <p className="text-xs text-gray-500">All products are stocked.</p>
      </motion.div>
    );
  }

  // 3. Alert State
  return (
    <motion.div 
      className="card p-5 border-l-4 border-alert-warning"
      whileHover={{ y: -2 }}
    >
      <h2 className="text-lg font-semibold text-gray-900 flex items-center mb-3">
        <AlertTriangle className="w-5 h-5 mr-2 text-alert-warning" />
        Action Needed
      </h2>
      
      <ul className="space-y-2 mb-4 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
        {outOfStockProducts.map((p) => (
          <li key={p.id} className="flex justify-between items-center text-sm text-gray-700 p-2 rounded hover:bg-gray-50">
            <span className="truncate flex-1 font-medium">{p.name}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 px-2 py-1 rounded ml-2">Empty</span>
          </li>
        ))}
        {lowStockProducts.map((p) => (
          <li key={p.id} className="flex justify-between items-center text-sm text-gray-700 p-2 rounded hover:bg-gray-50">
            <span className="truncate flex-1 font-medium">{p.name}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-800 px-2 py-1 rounded ml-2">{p.stock} Left</span>
          </li>
        ))}
      </ul>

      <Link
        to="/dashboard/products"
        className="btn-secondary-sm w-full flex justify-center"
      >
        Restock Now
      </Link>
    </motion.div>
  );
};