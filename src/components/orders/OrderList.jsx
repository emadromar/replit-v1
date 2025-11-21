// src/components/orders/OrderList.jsx
import React from 'react';
import { ShoppingBag, SlidersHorizontal, Eye } from 'lucide-react';
import { LockedFeatureTeaser } from '../shared/LockedFeatureTeaser.jsx';
import * as XLSX from 'xlsx';
import { Download } from 'lucide-react';
import { CURRENCY_CODE } from '../../config.js';

const getStatusClasses = (status) => {
  switch (status) {
    case 'COMPLETED': return 'bg-alert-success/10 text-alert-success border border-alert-success/20';
    case 'SHIPPED': return 'bg-blue-100 text-blue-800 border border-blue-200';
    case 'CANCELLED': return 'bg-red-100 text-red-800 border border-red-200';
    case 'PENDING': default: return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
  }
};

const StatusBadge = ({ status }) => (
  <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusClasses(status || 'PENDING')}`}>
    {status || 'PENDING'}
  </span>
);

const statusOptions = ['ALL', 'PENDING', 'SHIPPED', 'COMPLETED', 'CANCELLED'];

export function OrderList({
  orders, handleUpdateOrderStatus, currentPlanId, statusFilter, onStatusFilterChange,
  orderDateFilter, onDateFilterChange, totalOrdersCount, onViewDetails, onOpenUpgradeModal
}) {
  const isFreePlan = currentPlanId === 'free';
  const isProPlan = currentPlanId === 'pro';

  const exportToExcel = () => {
  if (orders.length === 0) return; 

  const data = orders.map(order => ({
    'Order ID': order.id.slice(-6).toUpperCase(),
    'Date': order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'N/A',
    'Customer Name': order.customerName || 'Guest',
    'Phone': order.customerPhone || 'N/A',
    'Total ({CURRENCY_CODE})': order.total || 0,
    'Status': order.status || 'PENDING',
    'Items': order.items ? order.items.map(i => `${i.quantity}x ${i.name}`).join(', ') : ''
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Orders");
  XLSX.writeFile(wb, `Orders_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
};

  return (
    <div className="card h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 border-b border-gray-100 pb-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center">
            <ShoppingBag className="w-5 h-5 mr-2 text-gray-500"/> All Orders
        </h2>
        <button 
          onClick={exportToExcel}
          className="btn-secondary-sm flex items-center gap-2 w-full md:w-auto"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export CSV</span>
        </button>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {isProPlan ? (
            <div className="w-full sm:w-auto">
              <select
                value={orderDateFilter}
                onChange={(e) => onDateFilterChange(e.target.value)}
                className="input py-1.5 text-sm w-full"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="last7days">Last 7 Days</option>
              </select>
            </div>
          ) : !isFreePlan && (
             <LockedFeatureTeaser title="Filter by Date" planName="Pro" onUpgrade={onOpenUpgradeModal} />
          )}
          
          {!isFreePlan ? (
            <div className="w-full sm:w-auto">
              <select
                id="order-status-filter"
                value={statusFilter}
                onChange={(e) => onStatusFilterChange(e.target.value)}
                className="input py-1.5 text-sm w-full"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status === 'ALL' ? 'All Statuses' : status}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>
      </div>
      
      {isFreePlan && (
         <LockedFeatureTeaser
            title="Order Filtering"
            description="Upgrade to Basic to filter orders by status, or Pro to also filter by date."
            icon={SlidersHorizontal}
            planName="Basic"
            onUpgrade={onOpenUpgradeModal}
            className="mb-4"
        />
      )}

      {!isFreePlan && (
        <div className="mb-4 px-4 py-3 bg-gray-50 rounded-lg border border-gray-100 flex justify-between items-center">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Total Orders</span>
          <p className="text-xl font-bold text-gray-900 tabular-nums">
            {orders.length} <span className="text-sm font-normal text-gray-400">/ {totalOrdersCount}</span>
          </p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto pr-2 space-y-3 min-h-[300px]">
        {orders.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
             <ShoppingBag className="w-12 h-12 mx-auto text-gray-300" />
            <h3 className="mt-4 text-base font-semibold text-gray-900">No orders yet</h3>
            <p className="text-gray-500 text-sm mt-1">
              {statusFilter !== 'ALL' || (isProPlan && orderDateFilter !== 'all')
                ? 'No orders match your filters.'
                : 'When you get a new order, it will appear here.'}
            </p>
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-sm transition-all cursor-pointer bg-white group"
              onClick={() => onViewDetails(order)}
            >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                           <p className="font-semibold text-gray-900 truncate">{order.customerName}</p>
                           <span className="text-xs text-gray-400 tabular-nums font-mono px-1.5 py-0.5 bg-gray-100 rounded">#{order.id.slice(-6).toUpperCase()}</span>
                        </div>
                        <p className="text-xs text-gray-500 tabular-nums">
                            {order.createdAt?.toDate ? new Date(order.createdAt.toDate()).toLocaleString() : 'N/A'}
                        </p>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-4 flex-shrink-0 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                        <p className="font-bold text-gray-900 tabular-nums">{CURRENCY_CODE} {order.total?.toFixed(2) || '0.00'}</p>
                        <div className="flex items-center gap-3">
                           <StatusBadge status={order.status} />
                           <Eye className="w-4 h-4 text-gray-300 group-hover:text-primary-600 transition-colors hidden sm:block" />
                        </div>
                    </div>
                </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}