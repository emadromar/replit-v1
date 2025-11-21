// src/components/dashboard/widgets/OverviewCard.jsx
import React from 'react';
import { DollarSign, Package, TrendingUp } from 'lucide-react';
import { CURRENCY_CODE } from '../../../config.js';

export const OverviewCard = ({ totalRevenue, totalOrders }) => {
  return (
    <div className="card bg-white border border-gray-200 shadow-DEFAULT">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-gray-500" />
          Performance Overview
        </h2>
        <span className="text-xs font-semibold text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
          All Time
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 sm:gap-12">
        {/* Revenue Section */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-500">
            <DollarSign className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-600 mb-0.5">Total Revenue</p>
            <p className="text-3xl font-bold text-gray-900 tracking-tight tabular-nums">
              ${CURRENCY_CODE} {totalRevenue}
            </p>
          </div>
        </div>

        {/* Vertical Divider (Desktop) / Horizontal (Mobile) */}
        <div className="hidden sm:block w-px h-16 bg-gray-100"></div>
        <div className="block sm:hidden w-full h-px bg-gray-100"></div>

        {/* Orders Section */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-500">
            <Package className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-600 mb-0.5">Total Orders</p>
            <p className="text-3xl font-bold text-gray-900 tracking-tight tabular-nums">
              {totalOrders}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};