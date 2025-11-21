// src/components/dashboard/widgets/OverviewCard.jsx
import React from 'react';
import { DollarSign, Package, TrendingUp } from 'lucide-react';
import { CURRENCY_CODE } from '../../../config.js';
export const OverviewCard = ({ totalRevenue, totalOrders }) => {
  return (
    <div className="card p-8 bg-white shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-primary-600" />
          Performance Overview
        </h2>
        <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
          All Time
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 sm:gap-12">
        {/* Revenue Section */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-xl border border-green-100">
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Revenue</p>
            <p className="text-3xl font-extrabold text-gray-900 tracking-tight">
              ${CURRENCY_CODE} {totalRevenue}
            </p>
          </div>
        </div>

        {/* Vertical Divider (Desktop only) */}
        <div className="hidden sm:block w-px h-16 bg-gray-100"></div>
        {/* Horizontal Divider (Mobile only) */}
        <div className="block sm:hidden w-full h-px bg-gray-100"></div>

        {/* Orders Section */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
            <Package className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Orders</p>
            <p className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {totalOrders}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};