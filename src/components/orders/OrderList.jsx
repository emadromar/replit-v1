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
  if (orders.length === 0) return; // Do nothing if no orders

  // 1. Format data for Excel
  const data = orders.map(order => ({
    'Order ID': order.id.slice(-6).toUpperCase(),
    'Date': order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'N/A',
    'Customer Name': order.customerName || 'Guest',
    'Phone': order.customerPhone || 'N/A',
    'Total ({CURRENCY_CODE})': order.total || 0,
    'Status': order.status || 'PENDING',
    'Items': order.items ? order.items.map(i => `${i.quantity}x ${i.name}`).join(', ') : ''
  }));

  // 2. Create Sheet
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Orders");

  // 3. Download
  XLSX.writeFile(wb, `Orders_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
};

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4 border-b pb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <ShoppingBag className="w-6 h-6 mr-3 text-primary-600"/> All Orders
        </h2>
        <button 
    onClick={exportToExcel}
    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
  >
    <Download className="w-4 h-4" />
    <span className="hidden sm:inline">Export CSV</span>
  </button>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {/* Pro Date Filter */}
          {isProPlan ? (
            <div className="w-full sm:w-auto">
              <select
                value={orderDateFilter}
                onChange={(e) => onDateFilterChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm shadow-sm focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="last7days">Last 7 Days</option>
              </select>
            </div>
          ) : !isFreePlan && (
             <LockedFeatureTeaser title="Filter by Date" planName="Pro" onUpgrade={onOpenUpgradeModal} />
          )}
          
          {/* Basic Status Filter */}
          {!isFreePlan ? (
            <div className="w-full sm:w-auto">
              <select
                id="order-status-filter"
                value={statusFilter}
                onChange={(e) => onStatusFilterChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm shadow-sm focus:ring-primary-500 focus:border-primary-500"
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
      
      {/* Free Plan Teaser */}
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

      {/* Summary */}
      {!isFreePlan && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
          <h3 className="text-sm font-medium text-gray-600 uppercase">Order Summary</h3>
          <p className="text-2xl font-bold text-gray-800">
            {orders.length} <span className="text-lg font-normal text-gray-500">of {totalOrdersCount} total orders shown</span>
          </p>
        </div>
      )}

      {/* List */}
      <div className="space-y-4 max-h-[60rem] overflow-y-auto pr-2">
        {orders.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
             <ShoppingBag className="w-12 h-12 mx-auto text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">No orders found</h3>
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
              className="card card-hover p-4 cursor-pointer"
              onClick={() => onViewDetails(order)}
            >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{order.customerName}</p>
                        <p className="text-sm text-gray-500">
                            Order ID: <code className="text-xs bg-gray-100 px-1 rounded font-mono">{order.id.slice(-6).toUpperCase()}</code>
                        </p>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                        <p className="font-bold text-lg text-alert-success">{CURRENCY_CODE} {order.total?.toFixed(2) || '0.00'}</p>
                        <StatusBadge status={order.status} />
                        <Eye className="w-5 h-5 text-gray-400 hidden sm:block" />
                    </div>
                </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}