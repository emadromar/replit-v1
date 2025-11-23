// src/components/orders/OrderList.jsx
import React, { useState } from 'react';
import { ShoppingBag, SlidersHorizontal, Eye, Download, Calendar, User, ChevronRight, Loader2, ArrowUpDown, X, Filter } from 'lucide-react';
import { LockedButton } from '../shared/LockedButton.jsx';
import * as XLSX from 'xlsx';
import { CURRENCY_CODE } from '../../config.js';

const getStatusClasses = (status) => {
  switch (status) {
    case 'COMPLETED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-100';
    case 'SHIPPED':
      return 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-100';
    case 'CANCELLED':
      return 'bg-red-50 text-red-700 border-red-200 ring-1 ring-red-100';
    case 'PENDING': default:
      return 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-100';
  }
};

const StatusBadge = ({ status }) => {
  const formatStatus = (s) => {
    if (!s) return 'Pending';
    return s.charAt(0) + s.slice(1).toLowerCase();
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold shadow-sm ${getStatusClasses(status || 'PENDING')}`}>
      {formatStatus(status)}
    </span>
  );
};

const statusOptions = ['ALL', 'PENDING', 'SHIPPED', 'COMPLETED', 'CANCELLED'];

const MobileOrderCard = ({ order, onClick }) => (
  <div
    onClick={() => onClick(order)}
    className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary-200 transition-all cursor-pointer active:scale-[0.99]"
  >
    <div className="flex justify-between items-start mb-3">
      <div className="flex flex-col">
        <span className="text-xs font-bold text-gray-400 tracking-wider mb-0.5">ORDER #{order.id.slice(-6).toUpperCase()}</span>
        <h4 className="font-semibold text-gray-900 text-base">{order.customerName || 'Guest Customer'}</h4>
      </div>
      <StatusBadge status={order.status} />
    </div>

    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
      <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
        <Calendar className="w-3.5 h-3.5" />
        {order.createdAt?.toDate ? new Date(order.createdAt.toDate()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
      </span>
      <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
        <ShoppingBag className="w-3.5 h-3.5" />
        {order.items?.length || 0} items
      </span>
    </div>

    <div className="flex justify-between items-center pt-3 border-t border-gray-50">
      <div className="flex flex-col">
        <span className="text-xs text-gray-400 font-medium uppercase">Total</span>
        <span className="text-lg font-bold text-gray-900 tracking-tight">
          {CURRENCY_CODE} {order.total?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
        </span>
      </div>
      <button className="flex items-center text-primary-600 text-sm font-bold bg-primary-50 px-3 py-1.5 rounded-lg hover:bg-primary-100 transition-colors">
        View Details <ChevronRight className="w-4 h-4 ml-1" />
      </button>
    </div>
  </div>
);

export function OrderList({
  orders, currentPlanId, statusFilter, onStatusFilterChange,
  orderDateFilter, onDateFilterChange, totalOrdersCount, onViewDetails, onOpenUpgradeModal, isLoading, store, showSuccess, showError
}) {
  const isFreePlan = currentPlanId === 'free';
  const isProPlan = currentPlanId === 'pro';

  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('desc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedOrders = React.useMemo(() => {
    if (!sortField) return orders;

    return [...orders].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === 'createdAt') {
        aVal = a.createdAt?.toDate?.() || new Date(0);
        bVal = b.createdAt?.toDate?.() || new Date(0);
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [orders, sortField, sortDirection]);

  const exportToExcel = () => {
    if (orders.length === 0) {
      showError?.('No orders to export');
      return;
    }
    try {
      const data = orders.map(order => ({
        'Order ID': order.id.slice(-6).toUpperCase(),
        'Date': order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'N/A',
        'Customer': order.customerName || 'Guest',
        'Total': order.total || 0,
        'Status': order.status || 'PENDING',
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Orders");
      XLSX.writeFile(wb, `Orders_Export.xlsx`);
      showSuccess?.(`Exported ${orders.length} ${orders.length === 1 ? 'order' : 'orders'} successfully`);
    } catch (error) {
      showError?.('Failed to export orders');
    }
  };

  return (
    <div className="card h-full flex flex-col p-0 overflow-hidden bg-gray-50 md:bg-white border-0 md:border shadow-sm">
      {/* Header Section */}
      <div className="p-5 border-b border-gray-100 bg-white">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              Orders
              <span className="ml-3 text-xs font-semibold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-full border border-primary-100">
                {orders.length === totalOrdersCount ? totalOrdersCount : `${orders.length} / ${totalOrdersCount}`}
              </span>
            </h2>
            <p className="text-sm text-gray-500 mt-1">Manage and track your customer orders</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Export Button */}
            <button
              onClick={exportToExcel}
              className="btn-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:text-gray-900 flex items-center shadow-sm"
              title="Export to Excel"
            >
              <Download className="w-4 h-4 mr-2 text-gray-500" /> Export
            </button>

            {/* Status Filter */}
            <div className="relative">
              {isFreePlan ? (
                <LockedButton feature="Filter" planName="BASIC" onClick={onOpenUpgradeModal} className="w-full md:w-auto" />
              ) : (
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => onStatusFilterChange(e.target.value)}
                    className="input pl-9 py-2 text-sm w-full md:w-40 bg-white border-gray-200 focus:border-primary-500 focus:ring-primary-500 rounded-lg cursor-pointer hover:border-gray-300 transition-colors"
                  >
                    {statusOptions.map(s => <option key={s} value={s}>{s === 'ALL' ? 'All Status' : s}</option>)}
                  </select>
                </div>
              )}
            </div>

            {/* Date Filter */}
            {isProPlan ? (
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={orderDateFilter}
                  onChange={(e) => onDateFilterChange(e.target.value)}
                  className="input pl-9 py-2 text-sm w-full md:w-40 bg-white border-gray-200 focus:border-primary-500 focus:ring-primary-500 rounded-lg cursor-pointer hover:border-gray-300 transition-colors"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="last7days">Last 7 Days</option>
                </select>
              </div>
            ) : !isFreePlan ? (
              <LockedButton feature="Date Filter" planName="PRO" onClick={onOpenUpgradeModal} className="w-full md:w-auto" />
            ) : null}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 overflow-y-auto bg-gray-50 md:bg-white">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="w-10 h-10 animate-spin text-primary-600 mb-4" />
            <p className="text-sm font-medium text-gray-600">Loading your orders...</p>
          </div>
        ) : totalOrdersCount === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-center p-8 max-w-md mx-auto">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-50 to-white border border-primary-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
              <ShoppingBag className="w-10 h-10 text-primary-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-500 mb-8 leading-relaxed">
              When customers place orders, they will appear here. Share your store link to get started!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
              <a href={`/${currentPlanId === 'pro' && store?.customPath ? store.customPath : 'store'}`} target="_blank" rel="noopener noreferrer" className="btn-primary px-6 py-2.5 shadow-md hover:shadow-lg transition-all">
                Preview Store
              </a>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-center p-6 max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Filter className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No orders match filters</h3>
            <p className="text-sm text-gray-500 mb-6">
              Try adjusting your filters to see more results.
            </p>
            <button onClick={() => { onStatusFilterChange('ALL'); onDateFilterChange('all'); }} className="btn-secondary px-6 py-2">
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            {/* Mobile List */}
            <div className="md:hidden space-y-3 p-4 pb-20">
              {sortedOrders.map(order => <MobileOrderCard key={order.id} order={order} onClick={onViewDetails} />)}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-primary-600 transition-colors group" onClick={() => handleSort('id')}>
                      <div className="flex items-center gap-1">Order ID {sortField === 'id' && <ArrowUpDown className="w-3 h-3 opacity-50 group-hover:opacity-100" />}</div>
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-primary-600 transition-colors group" onClick={() => handleSort('customerName')}>
                      <div className="flex items-center gap-1">Customer {sortField === 'customerName' && <ArrowUpDown className="w-3 h-3 opacity-50 group-hover:opacity-100" />}</div>
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-primary-600 transition-colors group" onClick={() => handleSort('createdAt')}>
                      <div className="flex items-center gap-1">Date {sortField === 'createdAt' && <ArrowUpDown className="w-3 h-3 opacity-50 group-hover:opacity-100" />}</div>
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-primary-600 transition-colors group" onClick={() => handleSort('total')}>
                      <div className="flex items-center gap-1">Total {sortField === 'total' && <ArrowUpDown className="w-3 h-3 opacity-50 group-hover:opacity-100" />}</div>
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-primary-600 transition-colors group" onClick={() => handleSort('status')}>
                      <div className="flex items-center gap-1">Status {sortField === 'status' && <ArrowUpDown className="w-3 h-3 opacity-50 group-hover:opacity-100" />}</div>
                    </th>
                    <th scope="col" className="relative px-6 py-4"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-50">
                  {sortedOrders.map((order) => (
                    <tr key={order.id} onClick={() => onViewDetails(order)} className="hover:bg-primary-50/50 cursor-pointer transition-all group">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 font-mono">#{order.id.slice(-6).toUpperCase()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-100 to-primary-50 text-primary-700 flex items-center justify-center text-xs font-bold mr-3 border border-primary-100">
                            {order.customerName?.charAt(0) || 'G'}
                          </div>
                          <div className="text-sm font-medium text-gray-900">{order.customerName || 'Guest'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        {CURRENCY_CODE} {order.total?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-gray-400 hover:text-primary-600 transition-colors p-2 rounded-full hover:bg-primary-50">
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}